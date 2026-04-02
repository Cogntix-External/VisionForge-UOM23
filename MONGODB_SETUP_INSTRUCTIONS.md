# MongoDB Test Data Setup

## Option 1: Using MongoDB Command Line

Run this in your MongoDB shell (mongosh or mongo):

```javascript
use crms

db.proposals.insertMany([
  {
    title: "Mobile App Development",
    description: "Build a cross-platform mobile application using React Native",
    clientId: "CLIENT-001",
    companyId: "COMPANY-001",
    status: "PENDING",
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stageHistory: [
      {
        stage: "PENDING",
        changedBy: "COMPANY-001",
        changeType: "COMPANY_CREATED",
        changedAt: new Date(),
        notes: "Proposal created by company"
      }
    ]
  },
  {
    title: "Cloud Migration",
    description: "Migrate existing infrastructure to AWS with zero downtime",
    clientId: "CLIENT-001",
    companyId: "COMPANY-001",
    status: "PENDING",
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stageHistory: [
      {
        stage: "PENDING",
        changedBy: "COMPANY-001",
        changeType: "COMPANY_CREATED",
        changedAt: new Date(),
        notes: "Proposal created by company"
      }
    ]
  },
  {
    title: "Data Analytics Dashboard",
    description: "Create real-time analytics dashboard with Power BI integration",
    clientId: "CLIENT-001",
    companyId: "COMPANY-001",
    status: "PENDING",
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stageHistory: [
      {
        stage: "PENDING",
        changedBy: "COMPANY-001",
        changeType: "COMPANY_CREATED",
        changedAt: new Date(),
        notes: "Proposal created by company"
      }
    ]
  }
])

// Verify data was inserted
db.proposals.find({ clientId: "CLIENT-001" }).pretty()
```

## Option 2: View the Setup Page

Open this file in your browser:
```
file:///c:/Users/janu/Desktop/Crms-cognitix/VisionForge-UOM23/test-setup.html
```

Then click "Set Client ID" button to initialize localStorage with CLIENT-001

## How to Test the Workflow

1. **Step 1**: Open test setup page and set Client ID to `CLIENT-001`
2. **Step 2**: Go to http://localhost:3000/client/Proposal
3. **Step 3**: You should see proposals list
4. **Step 4**: Click "View" on any proposal
5. **Step 5**: Click "Accept Proposal" or "Reject Proposal"
6. **Step 6**: Check MongoDB to verify stage history was updated

## Check Results in MongoDB

After accepting/rejecting a proposal, run:

```javascript
use crms

// View a specific proposal with stage history
db.proposals.findOne({ 
  clientId: "CLIENT-001",
  status: { $ne: "PENDING" }
}, { stageHistory: 1, status: 1, rejectionReason: 1 })

// View all proposals for the client
db.proposals.find({ clientId: "CLIENT-001" }).pretty()
```

You should see:
- ✅ Updated status (ACCEPTED or REJECTED)
- ✅ Stage history with 2 entries (COMPANY_CREATED, CLIENT_ACCEPTED/REJECTED)
- ✅ Rejection reason (if rejected)
- ✅ Timestamps for each stage change
- ✅ Client ID as changedBy
