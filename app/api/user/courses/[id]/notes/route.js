import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Note from "@/lib/models/Note";

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    await connectDB();

    const query = {
      user: auth.userId,
      course: courseId,
    };

    if (videoId) {
      query.video = videoId;
    }

    const notes = await Note.find(query).sort({ createdAt: -1 }).lean();

    const formattedNotes = notes.map((note) => ({
      id: note._id.toString(),
      ...note,
      _id: undefined,
    }));

    return NextResponse.json(formattedNotes);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;
    const { videoId, content, timestamp, tags } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const newNote = new Note({
      user: auth.userId,
      course: courseId,
      video: videoId || null,
      content: content.trim(),
      timestamp: timestamp || 0,
      tags: tags || [],
    });

    await newNote.save();

    const savedNote = {
      id: newNote._id.toString(),
      user: newNote.user,
      course: newNote.course,
      video: newNote.video,
      content: newNote.content,
      timestamp: newNote.timestamp,
      tags: newNote.tags,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt,
    };

    return NextResponse.json(savedNote, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;
    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      user: auth.userId,
      course: courseId,
    });

    if (!deletedNote) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Note deleted successfully",
      id: noteId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
