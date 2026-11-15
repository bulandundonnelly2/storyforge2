import Link from 'next/link';

export default function Arcade(){
 return <main style={{minHeight:'100vh',background:'#08070d',color:'#eee',fontFamily:'monospace',padding:'24px 18px',textAlign:'center'}}>
  <Link href="/" style={{color:'#eee'}}>← ELDERNIGHT</Link>
  <h1 style={{color:'#e32646',fontSize:36}}>RETRO ARCADE</h1>
  <p>THE DARK 8-BIT ARCADE</p>
  <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginTop:24}}>
   <Link href="/arcade/fatality" style={{display:'block',background:'#1b121c',color:'#fff',border:'2px solid #b91532',padding:25,fontFamily:'monospace',fontSize:18,textDecoration:'none',width:'min(100%,450px)',boxSizing:'border-box'}}>
    <img src="/assets/fatality-forge-arena.png" alt="Fatality Forge retro pixel-art arcade battle" style={{width:'100%',aspectRatio:'16/10',objectFit:'cover',objectPosition:'center 29%',imageRendering:'pixelated',display:'block',marginBottom:14,border:'1px solid #6c2638',boxSizing:'border-box'}}/>
    <span>FATALITY FORGE →</span>
   </Link>
  </div>
 </main>;
}
