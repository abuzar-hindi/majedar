import Link from "next/link";

export default function LoginPage() {
  return <main className="login-page"><div className="login-ornament">M</div><section className="login-panel"><p className="eyebrow">Majedaar restaurant office</p><h1>Welcome back.</h1><p className="login-copy">Sign in to manage your restaurant with a little more ease.</p><form className="login-form"><label className="form-field"><span>Email address</span><input type="email" placeholder="you@majedaar.in" /></label><label className="form-field"><span>Password</span><input type="password" placeholder="Enter your password" /></label><div className="login-options"><label><input type="checkbox" /> Remember me</label><Link href="/login">Forgot password?</Link></div><button className="button button-primary" type="button">Sign in to office</button></form><small className="login-note">Demo interface · Authentication will be connected later</small></section></main>;
}
