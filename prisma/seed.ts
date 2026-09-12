import { PrismaClient } from '@prisma/client'
const prisma=new PrismaClient()
const names=['Monica','Irene','Sunita','Theresa','Ragnar','Mafia','Caesar','Pablo','Alexa','Rahat']
async function main(){
 for(let i=0;i<names.length;i++){const name=names[i];const bedrooms=i<8?1:2;await prisma.apartment.upsert({where:{slug:name.toLowerCase()},update:{},create:{slug:name.toLowerCase(),name,type:`${bedrooms} Bedroom Apartment`,bedrooms,bathrooms:bedrooms,capacity:bedrooms===1?2:4,pricePerNight:bedrooms===1?200000:400000,status:'AVAILABLE',description:`A refined ${bedrooms}-bedroom luxury apartment in Ikota GRA, designed for privacy, comfort and effortless city living.`,images:{create:[{url:`/images/apartments/${name.toLowerCase()}-1.jpg`,alt:`${name} living room`},{url:`/images/apartments/${name.toLowerCase()}-2.jpg`,alt:`${name} bedroom`} ]},amenities:{create:['High-Speed Wi-Fi','Smart 65” TV','Full AC','Kitchen','Housekeeping'].map(a=>({name:a}))}}})}
 console.log('Seeded 10 apartments')}
main().finally(()=>prisma.$disconnect())
