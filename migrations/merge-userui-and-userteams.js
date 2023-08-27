const mongoose = require("mongoose");

async function migrateUserDocuments(session) {
  const sessionOption = session ? { session } : {};

  // Fetch existing documents directly from collections
  const userTeamsDocs = await mongoose.connection.db.collection("userteams").find({}).toArray();
  const userUIDocs = await mongoose.connection.db.collection("useruis").find({}).toArray();

  for (const userTeamsDoc of userTeamsDocs) {
    const { userId, orgId, teams } = userTeamsDoc;

    // Look for matching userUI document
    const matchingUserUI = userUIDocs.find((u) => u.userId === userId && u.orgId === orgId);

    // Create new User document payload
    const newUserDoc = {
      userId,
      orgId,
      teams,
      // more fields can be added here
    };

    if (matchingUserUI) {
      newUserDoc["latestTeamId"] = matchingUserUI.latestTeamId;
      newUserDoc["auth"] = matchingUserUI.auth;
      // add other fields from matchingUserUI if necessary
    }

    // Insert the new User document into the new User collection
    await mongoose.connection.db.collection("users").insertOne(newUserDoc, sessionOption);
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_DB_URL);

  // Create a session if you want the migration to be atomic
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await migrateUserDocuments(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("Migration failed", error);
  } finally {
    session.endSession();
    mongoose.connection.close();
  }
}

main();
