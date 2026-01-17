/**
 * Locale 工具函数
 */

import type { Locale, LocaleInfo } from "../types";

/**
 * 验证 locale 格式
 * @param locale - 要验证的 locale 字符串
 * @returns 是否为有效的 locale 格式
 */
export function isValidLocale(locale: string): boolean {
  if (!locale || typeof locale !== "string") {
    return false;
  }

  // 简单的格式验证：支持语言代码、语言-地区、语言-脚本-地区等格式
  // 如：en, en-US, zh-Hans-CN, zh-Hant-TW
  const localePattern =
    /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2,3})?(?:-[a-z]{4})?(?:-[A-Z][a-z]{3})?(?:-[0-9]{3})?$/i;
  return localePattern.test(locale);
}

/**
 * 规范化 locale 字符串
 * @param locale - 要规范化的 locale 字符串
 * @returns 规范化后的 locale 字符串
 */
export function normalizeLocale(locale: string): string {
  if (!locale) {
    return "en";
  }

  // 规范化格式：语言代码小写，脚本代码首字母大写其余小写，地区代码大写
  // 如：zh-Hans-CN, en-US
  const parts = locale.split("-");
  const language = parts[0]?.toLowerCase() || "en";

  if (parts.length === 1) {
    return language;
  }

  // 检查第二部分是脚本代码（4个字母）还是地区代码（2-3个字母）
  const secondPart = parts[1];
  if (secondPart && secondPart.length === 4 && /^[a-z]{4}$/i.test(secondPart)) {
    // 脚本代码：首字母大写，其余小写
    const script =
      secondPart.charAt(0).toUpperCase() + secondPart.slice(1).toLowerCase();
    const region = parts[2]?.toUpperCase();
    return region ? `${language}-${script}-${region}` : `${language}-${script}`;
  } else {
    // 地区代码：大写
    const region = secondPart?.toUpperCase();
    return region ? `${language}-${region}` : language;
  }
}

/**
 * 解析 locale 信息
 * @param locale - locale 字符串
 * @returns Locale 信息对象
 */
export function parseLocale(locale: string): LocaleInfo {
  const normalized = normalizeLocale(locale);
  const parts = normalized.split("-");

  const info: LocaleInfo = {
    code: normalized,
    language: parts[0] || "en",
  };

  if (parts.length > 1) {
    // 检查是否是脚本代码（4个字母，首字母大写）还是地区代码（2-3个大写字母）
    const secondPart = parts[1];
    if (
      secondPart &&
      secondPart.length === 4 &&
      /^[A-Z][a-z]{3}$/.test(secondPart)
    ) {
      info.script = secondPart;
      info.region = parts[2];
    } else {
      info.region = secondPart;
    }
  }

  return info;
}

/**
 * 获取父 locale（如 'zh-CN' -> 'zh'）
 * @param locale - locale 字符串
 * @returns 父 locale 字符串
 */
export function getParentLocale(locale: string): string | null {
  const info = parseLocale(locale);
  return info.language !== info.code ? info.language : null;
}

/**
 * 检测浏览器语言偏好（仅浏览器环境）
 * @returns 浏览器语言列表，按优先级排序
 */
export function detectBrowserLocales(): string[] {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !navigator
  ) {
    return ["en"];
  }

  const languages: string[] = [];

  // navigator.languages 包含所有语言偏好（最优先）
  if (Array.isArray(navigator.languages)) {
    languages.push(...navigator.languages);
  }

  // navigator.language 是主要语言
  if (navigator.language && !languages.includes(navigator.language)) {
    languages.push(navigator.language);
  }

  // navigator.userLanguage (IE)
  if (
    (navigator as any).userLanguage &&
    !languages.includes((navigator as any).userLanguage)
  ) {
    languages.push((navigator as any).userLanguage);
  }

  return languages.length > 0 ? languages : ["en"];
}

/**
 * 匹配最佳 locale
 * @param requestedLocale - 请求的 locale
 * @param availableLocales - 可用的 locale 列表
 * @returns 匹配的最佳 locale，如果没有匹配则返回 null
 */
export function matchLocale(
  requestedLocale: string,
  availableLocales: string[]
): string | null {
  if (availableLocales.includes(requestedLocale)) {
    return requestedLocale;
  }

  // 尝试匹配父 locale
  const parentLocale = getParentLocale(requestedLocale);
  if (parentLocale && availableLocales.includes(parentLocale)) {
    return parentLocale;
  }

  // 尝试模糊匹配（仅语言代码）
  const requestedLang = parseLocale(requestedLocale).language;
  for (const available of availableLocales) {
    if (parseLocale(available).language === requestedLang) {
      return available;
    }
  }

  return null;
}
