import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "online_test",
        "interview",
        "offer",
        "rejected",
        "withdrawn",
      ],
      default: "applied",
      index: true,
    },
    applicationType: {
      type: String,
      enum: ["on_campus", "off_campus"],
      default: "off_campus",
      index: true,
    },
    dateApplied: {
      type: Date,
      required: [true, "Date applied is required"],
    },
    interviewDate: {
      type: Date,
      default: null,
      index: true,
    },
    applicationSource: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    resumeLink: {
      type: String,
      trim: true,
      default: null,
    },
    portfolioLink: {
      type: String,
      trim: true,
      default: null,
    },
    interviewRounds: [
      {
        round: {
          type: String,
          required: true,
          trim: true,
        },
        date: {
          type: Date,
          default: null,
        },
        feedback: {
          type: String,
          trim: true,
          default: null,
        },
        status: {
          type: String,
          enum: ["scheduled", "completed", "passed", "failed"],
          default: "scheduled",
        },
      },
    ],
    interviewQuestions: [
      {
        round: {
          type: String,
          trim: true,
          default: null,
        },
        question: {
          type: String,
          trim: true,
          default: null,
        },
        // Prefer using notes_or_answer going forward for clarity.
        // Legacy documents may still have an `answer` field.
        notes_or_answer: {
          type: String,
          trim: true,
          default: null,
        },
      },
    ],
    preparationNotes: {
      type: String,
      trim: true,
      default: null,
    },
    interviewDifficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    interviewStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for user + status (for analytics queries)
jobSchema.index({ user: 1, status: 1 });

// Index for date queries
jobSchema.index({ user: 1, dateApplied: -1 });

// Index for interview dates (for reminders)
jobSchema.index({ user: 1, interviewDate: 1 });

// Index for recent activity
jobSchema.index({ user: 1, updatedAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
