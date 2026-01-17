/**
 * 图片懒加载
 * 使用 IntersectionObserver 实现的图片懒加载
 */

import type { ImageLazyLoadOptions } from '../types';

/**
 * 图片懒加载
 */
export function imageLazyLoad(
  images: NodeListOf<HTMLImageElement> | HTMLImageElement[],
  options?: ImageLazyLoadOptions
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    console.warn('[imageLazyLoad] IntersectionObserver 不支持，使用降级方案');
    return fallbackLazyLoad(images, options);
  }

  const {
    rootMargin = '50px',
    threshold = 0.01,
    placeholder = '',
    onError = () => {},
  } = options || {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy');

          if (dataSrc) {
            // 设置占位图
            if (placeholder && !img.src) {
              img.src = placeholder;
            }

            // 加载真实图片
            const newImg = new Image();
            newImg.onload = () => {
              img.src = dataSrc;
              img.removeAttribute('data-src');
              img.removeAttribute('data-lazy');
              observer.unobserve(img);
            };
            newImg.onerror = () => {
              onError(img);
            };
            newImg.src = dataSrc;
          } else {
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin,
      threshold,
    }
  );

  // 观察所有图片
  images.forEach((img) => {
    observer.observe(img);
  });

  // 返回清理函数
  return () => {
    images.forEach((img) => {
      observer.unobserve(img);
    });
    observer.disconnect();
  };
}

/**
 * 降级方案：使用滚动事件
 */
function fallbackLazyLoad(
  images: NodeListOf<HTMLImageElement> | HTMLImageElement[],
  options?: ImageLazyLoadOptions
): () => void {
  const {
    placeholder = '',
    onError = () => {},
  } = options || {};

  const imageArray = Array.from(images);
  let ticking = false;

  const loadVisibleImages = () => {
    const windowHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    imageArray.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      const rect = htmlImg.getBoundingClientRect();
      const isVisible =
        rect.top < windowHeight + scrollTop && rect.bottom > scrollTop;

      if (isVisible) {
        const dataSrc = htmlImg.getAttribute('data-src') || htmlImg.getAttribute('data-lazy');

        if (dataSrc && !htmlImg.src) {
          if (placeholder) {
            htmlImg.src = placeholder;
          }

          const newImg = new Image();
          newImg.onload = () => {
            htmlImg.src = dataSrc;
            htmlImg.removeAttribute('data-src');
            htmlImg.removeAttribute('data-lazy');
          };
          newImg.onerror = () => {
            onError(htmlImg);
          };
          newImg.src = dataSrc;
        }
      }
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(loadVisibleImages);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // 初始加载
  loadVisibleImages();

  // 返回清理函数
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

/**
 * 懒加载单个图片
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  options?: ImageLazyLoadOptions
): () => void {
  return imageLazyLoad([img], options);
}
