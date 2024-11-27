import clientPromise from '@/lib/mongodb';
import { VideoModel } from '@/models/videoModel';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await clientPromise;
  const db = client.db('deepreel');

  const id = (await params).id;

  let myVideo = await db.videos.find({ id });
  console.log(myVideo);
  return NextResponse.json(myVideo);
}

export async function POST(request: Request) {
  const client = await clientPromise;

  const db = client.db('deepreel');
  const data = await request.json();
  let myVideo = await db.collection('videos').insertOne(data);
  return NextResponse.json(myVideo);
}
