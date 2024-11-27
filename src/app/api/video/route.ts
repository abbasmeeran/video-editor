import clientPromise from '@/lib/mongodb';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const client = await clientPromise;
  const db = client.db('deepreel');
  const videos = await db.collection('videos').find({}).toArray();
  return Response.json({ status: 200, data: videos });
}

export async function POST(request: Request) {
  const client = await clientPromise;

  const db = client.db('deepreel');
  const data = await request.json();
  let myVideo = await db.collection('videos').insertOne(data);
  return NextResponse.json(myVideo);
}
