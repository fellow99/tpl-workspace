// 一次性迁移脚本：把 tpl-app-api 硬编码中文消息替换为 MessageKey 常量引用
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'D:/tpl-workspace/tpl-app-api/src/main/java/org/fellow99/tpl/appapi/';
const IMPORT = 'import org.fellow99.tpl.appapi.model.MessageKey;';

// [文件相对路径, [[中文原文(含引号), 常量], ...]]
const mapping = [
  ['exception/GlobalExceptionHandler.java', [
    ['"未登录或登录已过期，请重新登录"', 'MessageKey.UNAUTHORIZED'],
    ['"无权限访问"', 'MessageKey.FORBIDDEN'],
    ['"微信登录失败，请稍后重试"', 'MessageKey.WECHAT_LOGIN_FAILED'],
    ['"请求参数格式错误"', 'MessageKey.BAD_REQUEST'],
    ['"服务器繁忙，请稍后再试"', 'MessageKey.SERVER_BUSY'],
  ]],
  ['controller/AuthController.java', [
    ['"请求体不能为空"', 'MessageKey.REQUEST_BODY_EMPTY'],
    ['"微信登录未启用"', 'MessageKey.WECHAT_NOT_ENABLED'],
    ['"该微信未绑定账号，请先绑定手机号"', 'MessageKey.WECHAT_UNBOUND_NEED_PHONE'],
    ['"该微信未绑定账号，请先使用手机号登录后在个人中心绑定微信"', 'MessageKey.WECHAT_UNBOUND_USE_PHONE_LOGIN'],
    ['"平台账号暂不支持"', 'MessageKey.WECHAT_PLATFORM_UNSUPPORTED'],
    ['"平台账号未配置"', 'MessageKey.WECHAT_PLATFORM_NOT_CONFIGURED'],
    ['"取消授权失败"', 'MessageKey.UNBIND_FAILED'],
  ]],
  ['controller/SysSocialController.java', [
    ['"微信登录未启用"', 'MessageKey.WECHAT_NOT_ENABLED'],
  ]],
  ['service/AuthService.java', [
    ['"手机号不能为空"', 'MessageKey.PHONE_EMPTY'],
    ['"短信验证码错误"', 'MessageKey.SMS_CODE_INCORRECT'],
    ['"密码不能为空"', 'MessageKey.PASSWORD_REQUIRED'],
    ['"无法创建用户"', 'MessageKey.USER_CREATE_FAILED'],
    ['"用户已存在且密码不正确"', 'MessageKey.USER_EXISTS_PASSWORD_WRONG'],
    ['"用户已创建，请登录"', 'MessageKey.USER_CREATED'],
    ['"手机号和密码不能为空"', 'MessageKey.PHONE_PASSWORD_REQUIRED'],
    ['"登录失败"', 'MessageKey.LOGIN_FAILED'],
    ['"用户不存在"', 'MessageKey.USER_NOT_FOUND'],
    ['"用户已被停用"', 'MessageKey.USER_DISABLED'],
    ['"该账号未设置密码，请使用微信登录"', 'MessageKey.NO_PASSWORD_USE_WECHAT'],
  ]],
  ['service/UserService.java', [
    ['"用户不存在"', 'MessageKey.USER_NOT_FOUND'],
    ['"昵称不能为空"', 'MessageKey.NICKNAME_REQUIRED'],
    ['"当前密码不正确"', 'MessageKey.CURRENT_PASSWORD_WRONG'],
    ['"新密码不能为空"', 'MessageKey.NEW_PASSWORD_REQUIRED'],
    ['"两次输入的密码不一致"', 'MessageKey.PASSWORD_MISMATCH'],
    ['"短信验证码错误"', 'MessageKey.SMS_CODE_INCORRECT'],
  ]],
  ['service/SmsService.java', [
    ['"验证码未过期，无需重复发送"', 'MessageKey.SMS_NOT_EXPIRED'],
    ['"短信发送失败，请稍后重试"', 'MessageKey.SMS_SEND_FAILED'],
    ['"手机号格式不正确"', 'MessageKey.PHONE_INVALID'],
    ['"验证码格式不正确，应为 4-6 位数字或字母"', 'MessageKey.CAPTCHA_INVALID_FORMAT'],
  ]],
  ['service/CaptchaService.java', [
    ['"验证码不能为空"', 'MessageKey.CAPTCHA_REQUIRED'],
    ['"验证码已过期"', 'MessageKey.CAPTCHA_EXPIRED'],
    ['"验证码错误"', 'MessageKey.CAPTCHA_INCORRECT'],
  ]],
  ['service/strategy/XcxAuthStrategy.java', [
    ['"小程序登录code不能为空"', 'MessageKey.WECHAT_XCX_CODE_REQUIRED'],
    ['"用户不存在"', 'MessageKey.USER_NOT_FOUND'],
    ['"用户已被停用"', 'MessageKey.USER_DISABLED'],
    ['"获取微信手机号失败"', 'MessageKey.WECHAT_GET_PHONE_FAILED'],
    ['"小程序配置缺失"', 'MessageKey.WECHAT_XCX_CONFIG_MISSING'],
  ]],
  ['service/strategy/SocialAuthStrategy.java', [
    ['"第三方登录参数不能为空"', 'MessageKey.SOCIAL_PARAM_REQUIRED'],
    ['"绑定的用户不存在"', 'MessageKey.SOCIAL_BOUND_USER_NOT_FOUND'],
    ['"用户已被停用"', 'MessageKey.USER_DISABLED'],
  ]],
  ['service/strategy/IAuthStrategy.java', [
    ['"不支持的授权类型"', 'MessageKey.UNSUPPORTED_GRANT_TYPE'],
  ]],
  ['service/SysSocialService.java', [
    ['"此三方账号已被绑定"', 'MessageKey.SOCIAL_ALREADY_BOUND'],
  ]],
  ['util/WechatAuthUtils.java', [
    ['"不支持的第三方登录类型"', 'MessageKey.WECHAT_UNSUPPORTED_SOURCE'],
    ['"未获取到有效的Auth配置"', 'MessageKey.WECHAT_INVALID_AUTH_CONFIG'],
  ]],
  ['filter/ApiDecryptFilter.java', [
    ['"请求解密失败"', 'MessageKey.DECRYPT_FAILED'],
  ]],
];

let total = 0;
for (const [file, reps] of mapping) {
  const path = ROOT + file;
  let content = readFileSync(path, 'utf8');
  for (const [from, to] of reps) {
    const before = content;
    content = content.split(from).join(to);
    total += (before.split(from).length - 1);
  }
  if (!content.includes(IMPORT)) {
    content = content.replace(/^(package [^;]+;)\s*\n/, `$1\n\n${IMPORT}`);
  }
  writeFileSync(path, content);
  console.log('done', file);
}
console.log('total replaced:', total);
