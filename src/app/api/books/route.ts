// app/api/books/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const body = await req.json();

    const {
      fullName,
      penName,
      mobilePhone,
      homePhone,
      address,
      email,
      title,
      subtitle,
      aboutAuthor,
      photoCount,
      copyrightedMaterial,
      targetAudience,
      dedications,
      acknowledgements,
      backCoverBlurb,
      categories = [],
      coverIdea,
      coverNotes,
      profileImage,
      coverImage,
      status = "Draft",
    } = body;

    // Final submission validation
    if (status === "Submitted" && (!title || categories.length === 0)) {
      return NextResponse.json(
        { error: "Title and at least one category required to submit" },
        { status: 400 }
      );
    }

    let submission;
    let message;

    if (status === "Submitted") {
      // Always create a new submission
      submission = await prisma.bookSubmission.create({
        data: {
          userId,
          fullName,
          penName,
          mobilePhone,
          homePhone,
          address,
          email,
          title,
          subtitle,
          aboutAuthor,
          photoCount: photoCount ? Number(photoCount) : 0,
          copyrightedMaterial,
          targetAudience,
          dedications,
          acknowledgements,
          backCoverBlurb,
          categories,
          coverIdea,
          coverNotes,
          profileImage,
          coverImage,
          status: "Submitted",
        },
      });

      message = "Book submitted for review!";
    } else {
      // Draft: ONLY ONE per user
      const existingDraft = await prisma.bookSubmission.findFirst({
        where: {
          userId,
          status: "Draft",
        },
      });

      if (existingDraft) {
        submission = await prisma.bookSubmission.update({
          where: { id: existingDraft.id },
          data: {
            fullName,
            penName,
            mobilePhone,
            homePhone,
            address,
            email,
            title,
            subtitle,
            aboutAuthor,
            photoCount: photoCount ? Number(photoCount) : undefined,
            copyrightedMaterial,
            targetAudience,
            dedications,
            acknowledgements,
            backCoverBlurb,
            categories,
            coverIdea,
            coverNotes,
            profileImage,
            coverImage,
          },
        });
      } else {
        submission = await prisma.bookSubmission.create({
          data: {
            userId,
            fullName,
            penName,
            mobilePhone,
            homePhone,
            address,
            email,
            title,
            subtitle,
            aboutAuthor,
            photoCount: photoCount ? Number(photoCount) : 0,
            copyrightedMaterial,
            targetAudience,
            dedications,
            acknowledgements,
            backCoverBlurb,
            categories,
            coverIdea,
            coverNotes,
            profileImage,
            coverImage,
            status: "Draft",
          },
        });
      }

      message = "Draft saved!";
    }


    return NextResponse.json({ message, submission });
  } catch (error: any) {
    console.error("Book submission error:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const draft = await prisma.bookSubmission.findFirst({
      where: {
        userId,
        status: "Draft",
      },
    });

    return NextResponse.json(draft || null);
  } catch (error: any) {
    console.error("Get draft error:", error);
    return NextResponse.json({ error: "Failed to fetch draft" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const existingDraft = await prisma.bookSubmission.findFirst({
      where: {
        userId,
        status: "Draft",
      },
    });

    if (existingDraft) {
      await prisma.bookSubmission.delete({
        where: { id: existingDraft.id },
      });
      return NextResponse.json({ message: "Draft deleted" });
    }

    return NextResponse.json({ message: "No draft to delete" });
  } catch (error: any) {
    console.error("Delete draft error:", error);
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}