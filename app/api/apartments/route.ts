import {NextResponse} from 'next/server';import {apartments} from '@/lib/data';export async function GET(){return NextResponse.json(apartments)}
