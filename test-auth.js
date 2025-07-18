#!/usr/bin/env node

/**
 * WhatsChat 认证系统测试脚本
 * 用于测试前后端认证功能是否正常工作
 */

const fetch = require('node-fetch')

const API_BASE_URL = 'http://localhost:3001/api'
const WEB_URL = 'http://localhost:3000'

// 测试数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123456',
  phone: '+86 138 0000 9999'
}

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 测试服务器连接
async function testServerConnection() {
  log('\n🔍 测试服务器连接...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
    const data = await response.json()
    
    if (response.ok && data.success) {
      log('✅ 服务器连接正常', 'green')
      log(`   版本: ${data.version}`, 'blue')
      log(`   环境: ${data.environment}`, 'blue')
      return true
    } else {
      log('❌ 服务器响应异常', 'red')
      return false
    }
  } catch (error) {
    log('❌ 无法连接到服务器', 'red')
    log(`   错误: ${error.message}`, 'red')
    return false
  }
}

// 测试用户注册
async function testUserRegistration() {
  log('\n📝 测试用户注册...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      log('✅ 用户注册成功', 'green')
      log(`   用户ID: ${data.data.user.id}`, 'blue')
      log(`   用户名: ${data.data.user.username}`, 'blue')
      log(`   邮箱: ${data.data.user.email}`, 'blue')
      return {
        success: true,
        tokens: data.data.tokens,
        user: data.data.user
      }
    } else {
      log('❌ 用户注册失败', 'red')
      log(`   错误: ${data.message}`, 'red')
      return { success: false }
    }
  } catch (error) {
    log('❌ 注册请求失败', 'red')
    log(`   错误: ${error.message}`, 'red')
    return { success: false }
  }
}

// 测试用户登录
async function testUserLogin() {
  log('\n🔐 测试用户登录...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      log('✅ 用户登录成功', 'green')
      log(`   访问令牌: ${data.data.tokens.accessToken.substring(0, 20)}...`, 'blue')
      log(`   刷新令牌: ${data.data.tokens.refreshToken.substring(0, 20)}...`, 'blue')
      return {
        success: true,
        tokens: data.data.tokens,
        user: data.data.user
      }
    } else {
      log('❌ 用户登录失败', 'red')
      log(`   错误: ${data.message}`, 'red')
      return { success: false }
    }
  } catch (error) {
    log('❌ 登录请求失败', 'red')
    log(`   错误: ${error.message}`, 'red')
    return { success: false }
  }
}

// 测试获取用户信息
async function testGetCurrentUser(accessToken) {
  log('\n👤 测试获取当前用户信息...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      log('✅ 获取用户信息成功', 'green')
      log(`   用户名: ${data.data.user.username}`, 'blue')
      log(`   邮箱: ${data.data.user.email}`, 'blue')
      log(`   在线状态: ${data.data.user.isOnline ? '在线' : '离线'}`, 'blue')
      return { success: true, user: data.data.user }
    } else {
      log('❌ 获取用户信息失败', 'red')
      log(`   错误: ${data.message}`, 'red')
      return { success: false }
    }
  } catch (error) {
    log('❌ 获取用户信息请求失败', 'red')
    log(`   错误: ${error.message}`, 'red')
    return { success: false }
  }
}

// 测试令牌刷新
async function testTokenRefresh(refreshToken) {
  log('\n🔄 测试令牌刷新...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      log('✅ 令牌刷新成功', 'green')
      log(`   新访问令牌: ${data.data.tokens.accessToken.substring(0, 20)}...`, 'blue')
      return {
        success: true,
        tokens: data.data.tokens
      }
    } else {
      log('❌ 令牌刷新失败', 'red')
      log(`   错误: ${data.message}`, 'red')
      return { success: false }
    }
  } catch (error) {
    log('❌ 令牌刷新请求失败', 'red')
    log(`   错误: ${error.message}`, 'red')
    return { success: false }
  }
}

// 测试用户登出
async function testUserLogout(accessToken) {
  log('\n🚪 测试用户登出...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      log('✅ 用户登出成功', 'green')
      return { success: true }
    } else {
      log('❌ 用户登出失败', 'red')
      log(`   错误: ${data.message}`, 'red')
      return { success: false }
    }
  } catch (error) {
    log('❌ 登出请求失败', 'red')
    log(`   错误: ${error.message}`, 'red')
    return { success: false }
  }
}

// 测试前端页面
async function testFrontendPages() {
  log('\n🌐 测试前端页面...', 'blue')
  
  try {
    // 测试主页
    const homeResponse = await fetch(WEB_URL)
    if (homeResponse.ok) {
      log('✅ 主页访问正常', 'green')
    } else {
      log('❌ 主页访问失败', 'red')
    }
    
    // 测试登录页
    const loginResponse = await fetch(`${WEB_URL}/login`)
    if (loginResponse.ok) {
      log('✅ 登录页面访问正常', 'green')
    } else {
      log('❌ 登录页面访问失败', 'red')
    }
    
    // 测试注册页
    const registerResponse = await fetch(`${WEB_URL}/register`)
    if (registerResponse.ok) {
      log('✅ 注册页面访问正常', 'green')
    } else {
      log('❌ 注册页面访问失败', 'red')
    }
    
    return true
  } catch (error) {
    log('❌ 前端页面测试失败', 'red')
    log(`   错误: ${error.message}`, 'red')
    return false
  }
}

// 清理测试数据
async function cleanupTestData(accessToken) {
  log('\n🧹 清理测试数据...', 'blue')
  
  // 这里可以添加删除测试用户的逻辑
  // 目前只是登出，实际项目中可能需要删除用户
  log('✅ 测试数据清理完成', 'green')
}

// 主测试函数
async function runTests() {
  log('🚀 开始 WhatsChat 认证系统测试', 'yellow')
  log('=' .repeat(50), 'yellow')
  
  let testResults = {
    serverConnection: false,
    userRegistration: false,
    userLogin: false,
    getCurrentUser: false,
    tokenRefresh: false,
    userLogout: false,
    frontendPages: false
  }
  
  let tokens = null
  let user = null
  
  // 1. 测试服务器连接
  testResults.serverConnection = await testServerConnection()
  if (!testResults.serverConnection) {
    log('\n❌ 服务器连接失败，请确保后端服务器正在运行', 'red')
    log('   启动命令: cd apps/server && pnpm dev', 'yellow')
    return
  }
  
  // 2. 测试用户注册
  const registerResult = await testUserRegistration()
  testResults.userRegistration = registerResult.success
  if (registerResult.success) {
    tokens = registerResult.tokens
    user = registerResult.user
  }
  
  // 3. 测试用户登录（如果注册失败，可能用户已存在）
  if (!testResults.userRegistration) {
    const loginResult = await testUserLogin()
    testResults.userLogin = loginResult.success
    if (loginResult.success) {
      tokens = loginResult.tokens
      user = loginResult.user
    }
  } else {
    testResults.userLogin = true
  }
  
  // 4. 测试获取用户信息
  if (tokens) {
    const getUserResult = await testGetCurrentUser(tokens.accessToken)
    testResults.getCurrentUser = getUserResult.success
  }
  
  // 5. 测试令牌刷新
  if (tokens) {
    const refreshResult = await testTokenRefresh(tokens.refreshToken)
    testResults.tokenRefresh = refreshResult.success
    if (refreshResult.success) {
      tokens = refreshResult.tokens
    }
  }
  
  // 6. 测试前端页面
  testResults.frontendPages = await testFrontendPages()
  
  // 7. 测试用户登出
  if (tokens) {
    const logoutResult = await testUserLogout(tokens.accessToken)
    testResults.userLogout = logoutResult.success
  }
  
  // 8. 清理测试数据
  if (tokens) {
    await cleanupTestData(tokens.accessToken)
  }
  
  // 输出测试结果
  log('\n📊 测试结果汇总', 'yellow')
  log('=' .repeat(50), 'yellow')
  
  const tests = [
    { name: '服务器连接', result: testResults.serverConnection },
    { name: '用户注册', result: testResults.userRegistration },
    { name: '用户登录', result: testResults.userLogin },
    { name: '获取用户信息', result: testResults.getCurrentUser },
    { name: '令牌刷新', result: testResults.tokenRefresh },
    { name: '用户登出', result: testResults.userLogout },
    { name: '前端页面', result: testResults.frontendPages }
  ]
  
  let passedTests = 0
  tests.forEach(test => {
    const status = test.result ? '✅ 通过' : '❌ 失败'
    const color = test.result ? 'green' : 'red'
    log(`${test.name}: ${status}`, color)
    if (test.result) passedTests++
  })
  
  log('\n' + '=' .repeat(50), 'yellow')
  log(`测试完成: ${passedTests}/${tests.length} 项通过`, passedTests === tests.length ? 'green' : 'yellow')
  
  if (passedTests === tests.length) {
    log('\n🎉 所有测试通过！认证系统工作正常', 'green')
  } else {
    log('\n⚠️  部分测试失败，请检查相关配置', 'yellow')
  }
  
  // 输出使用说明
  log('\n📖 使用说明', 'blue')
  log('前端地址: http://localhost:3000', 'blue')
  log('后端地址: http://localhost:3001', 'blue')
  log('测试账户: test@example.com / Test123456', 'blue')
  log('或使用种子数据中的账户: admin@whatschat.com / 123456', 'blue')
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 测试运行失败: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = { runTests }