const fs=require('fs'),{spawnSync}=require('child_process');
if(process.env.APP_ENV!=='homologacao')throw new Error('APP_ENV=homologacao is required');
for(const file of ['.env','.env.local','.env.production','.env.production.local'])if(fs.existsSync(file))throw new Error('Homologacao build refuses dotenv file: '+file);
for(const key of ['NEXT_PUBLIC_API_URL','NEXTAUTH_URL']) {
  const url=new URL(process.env[key]);
  if(url.protocol!=='https:' || !url.hostname.endsWith('.onrender.com'))throw new Error(key+' must be the dedicated Render homologacao HTTPS URL');
}
if(!process.env.NEXTAUTH_SECRET)throw new Error('A dedicated homologacao NEXTAUTH_SECRET is required');
const result=spawnSync('npm',['run','build'],{stdio:'inherit',env:{...process.env,NODE_ENV:'production'}});
process.exit(result.status??1);
