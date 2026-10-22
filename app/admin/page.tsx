'use client';
import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

type Stats = {
 registeredUsers:number|null; creatorsWithSavedGames:number; totalGames:number;
 publishedGames:number; storedContentBytes:number; gamesUpdatedThisMonth:number;
 month:string; note:string;
};
const format=(n:number|null)=>n===null?'Unavailable':n.toLocaleString('en-GB');
export default function AdminPage(){
 const {isLoaded,isSignedIn,getToken}=useAuth();
 const [stats,setStats]=useState<Stats|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{
  if(!isLoaded)return;
  if(!isSignedIn){setError('Sign in using the administrator account.');setLoading(false);return;}
  setLoading(true);setError('');
  try{
   const token=await getToken();
   const response=await fetch('/api/admin/stats',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
   if(!response.ok)throw Error(response.status===403?'Administrator access not configured for this account.':'Statistics could not be loaded.');
   setStats(await response.json());
  }catch(e){setStats(null);setError(e instanceof Error?e.message:'Unable to load statistics');}
  finally{setLoading(false)}
 },[isLoaded,isSignedIn,getToken]);
 useEffect(()=>{void refresh()},[refresh]);
 const cards=stats?[
  ['Registered users',format(stats.registeredUsers),'Clerk total users'],
  ['Creators with games',format(stats.creatorsWithSavedGames),'Distinct accounts with saved games'],
  ['Saved games',format(stats.totalGames),'All stored drafts'],
  ['Published games',format(stats.publishedGames),'Available shared snapshots'],
  ['Stored story content',(stats.storedContentBytes/1048576).toFixed(2)+' MB','Drafts and published JSON; excludes database overhead'],
  ['Games updated this month',format(stats.gamesUpdatedThisMonth),'Distinct games updated in '+stats.month],
 ]:[];
 return <main className="en-admin">
  <header><a href="/">← ELDERNIGHT</a><h1>ADMIN DASHBOARD</h1><p>LEGENDS YOU CREATE. ADVENTURES YOU FORGE.</p></header>
  {loading?<p role="status">Loading usage statistics…</p>:error?<p role="alert" className="en-admin-error">{error}</p>:stats?<><section className="en-admin-grid">{cards.map(([name,value,detail])=><article key={name}><h2>{name}</h2><strong>{value}</strong><small>{detail}</small></article>)}</section>
  <section className="en-admin-note"><h2>Monthly provider usage</h2><p>{stats.note}</p><p><strong>Vercel requests, Turso read/write quotas, and billed database storage</strong> are not accessible from this app without separate provider integrations. Check the provider dashboards for those totals.</p></section></>:null}
  <button type="button" onClick={()=>void refresh()} disabled={loading||!isSignedIn}>↻ Refresh statistics</button>
  <style jsx>{`
  .en-admin{min-height:100vh;background:#03031b;color:#f3f4ff;padding:3rem max(1rem,calc((100vw - 1080px)/2));font-family:monospace}
  header{border:3px solid #00eaff;padding:1.4rem;margin-bottom:1.5rem;box-shadow:7px 7px #3535ff}
  a{color:#00eaff}h1{font-size:clamp(1.5rem,4vw,2.6rem);color:#ffe500;margin:1rem 0}header p{color:#00eaff}
  .en-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1rem}
  article,.en-admin-note{border:2px solid #00eaff;background:#0a1035;padding:1.25rem}
  article h2{font-size:.9rem;color:#00eaff;margin:0 0 1rem}
  article strong{display:block;font-size:2rem;color:#ffe500;margin-bottom:.6rem}
  article small{color:#c8d4ed;font-size:.8rem;line-height:1.5}
  .en-admin-note{margin:1.5rem 0;line-height:1.6}.en-admin-note h2{color:#ffe500}
  .en-admin-error{padding:1rem;border:2px solid #ff4ca9;color:#ffbdde}
  button{background:#ffe500;color:#000;padding:.9rem 1.2rem;border:0;font-weight:900;cursor:pointer}button:disabled{opacity:.5}
  `}</style>
 </main>;
}
