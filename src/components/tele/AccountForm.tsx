import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Btn, Field, inputCls } from './ui';
import { signupHasSession } from '@/lib/tele/booking-rules';
import '@lovable.dev/cloud-auth-js/styles.css';

export function AccountForm() {
  const [mode,setMode] = useState<'signin'|'signup'|'forgot'>('signin');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();setBusy(true);setMessage('');
    try {
      if (mode==='forgot') {
        const {error} = await supabase.auth.resetPasswordForEmail(email,{redirectTo: `${window.location.origin}/reset-password`});
        if(error) throw error;
        setMessage('Check your email for a password reset link.');
      } else if(mode==='signup') {
        const {data,error} = await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin,data:{display_name:name.trim()}}});
        if(error) throw error;
        if(!signupHasSession(data.session)) setMessage('Check your email to confirm your account, then sign in.');
      } else {
        const {error} = await supabase.auth.signInWithPassword({email,password});
        if(error) throw error;
      }
    } catch(e) {setMessage(e instanceof Error ? e.message : 'Please try again.');}
    finally {setBusy(false);}
  }
  async function social(provider:'google'|'lovable') {
    setBusy(true);setMessage('');
    try {const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin});if(result.error) setMessage(result.error.message);}
    catch {setMessage('Sign-in could not be opened. Please try again.');}
    finally {setBusy(false);}
  }
  return <div className="space-y-5 px-5 py-8">
    <HeartPulse className="h-10 w-10 text-primary"/><div><h1 className="text-2xl font-bold">MediLink</h1><p className="mt-2 text-sm text-muted-foreground">{mode==='signup'?'Create your account':mode==='forgot'?'Reset your password':'Welcome back'}</p></div>
    <form onSubmit={submit} className="space-y-4">
      {mode==='signup'&&<Field label="Full name"><input required minLength={2} value={name} onChange={e=>setName(e.target.value)} className={inputCls} autoComplete="name"/></Field>}
      <Field label="Email"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className={inputCls} autoComplete="email"/></Field>
      {mode!=='forgot'&&<Field label="Password"><input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} className={inputCls} autoComplete={mode==='signup'?'new-password':'current-password'}/></Field>}
      {message&&<p role="status" className="text-sm text-primary">{message}</p>}
      <Btn type="submit" disabled={busy} className="w-full">{busy?'Please wait…':mode==='signup'?'Create account':mode==='forgot'?'Send reset link':'Sign in'}</Btn>
    </form>
    {mode!=='forgot'&&<div className="space-y-3"><Btn variant="outline" disabled={busy} onClick={()=>social('google')} className="w-full">Continue with Google</Btn><button disabled={busy} className="lovable-auth-button w-full" onClick={()=>social('lovable')}>Continue with Lovable</button></div>}
    <div className="flex flex-wrap justify-center gap-2"><Btn variant="ghost" className="h-9 px-2" onClick={()=>{setMode(mode==='signup'?'signin':'signup');setMessage('');}}>{mode==='signup'?'Already have an account?':'Create an account'}</Btn><Btn variant="ghost" className="h-9 px-2" onClick={()=>{setMode(mode==='forgot'?'signin':'forgot');setMessage('');}}>{mode==='forgot'?'Back to sign in':'Forgot password?'}</Btn></div>
  </div>;
}