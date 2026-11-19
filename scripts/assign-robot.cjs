#!/usr/bin/env node
/**
 * Instant Robot Ownership Transfer Script
 * Usage: node scripts/assign-robot.cjs [target_user_email]
 * Example: node scripts/assign-robot.cjs guest@gmail.com
 */

const mongoose = require('/Users/phyomyatmin/Desktop/Ai Robot_BE/node_modules/mongoose');

const MONGODB_URI = 'mongodb+srv://phyomyatmin646_db_user:9JDm8JUSfjI0pa6W@cluster0.eyussez.mongodb.net/ai-robot?retryWrites=true&w=majority';

async function assignRobot(targetEmail) {
  if (!targetEmail) {
    console.error('❌ Please provide user email: node scripts/assign-robot.cjs <email>');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB Atlas to transfer robot to: ${targetEmail}...`);
  await mongoose.connect(MONGODB_URI);

  try {
    const user = await mongoose.connection.collection('users').findOne({
      email: targetEmail.trim().toLowerCase(),
    });

    if (!user) {
      console.error(`❌ User with email "${targetEmail}" not found in database!`);
      const allUsers = await mongoose.connection.collection('users').find({}, { projection: { email: 1, name: 1 } }).toArray();
      console.log('Available users in database:', allUsers.map(u => u.email).join(', '));
      process.exit(1);
    }

    const userId = user._id;

    // Update devices collection
    const devRes = await mongoose.connection.collection('devices').updateMany(
      {}, // updates all active robots in this deployment
      { $set: { userId: userId } }
    );

    // Update devicesettings collection
    const setRes = await mongoose.connection.collection('devicesettings').updateMany(
      {},
      { $set: { userId: userId } }
    );

    console.log(`✅ SUCCESS! Robot ownership transferred to ${user.name} (${user.email})!`);
    console.log(`- Devices updated: ${devRes.modifiedCount}`);
    console.log(`- DeviceSettings updated: ${setRes.modifiedCount}`);
    console.log(`👉 Now refresh the browser on ${user.email}'s account to see the robot online!`);
  } catch (err) {
    console.error('Transfer failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

const emailArg = process.argv[2] || 'flextzy646@gmail.com';
assignRobot(emailArg);
