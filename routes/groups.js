import { Router } from "express";
import groupsCollection from "../db/groups-db.js";
import usersCollection from "../db/users-db.js";
import duesSubmissionsCollection from "../db/dues-submissions-db.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const groupsRouter = Router();

groupsRouter.get("/", requireRole("treasurer" ), async (req, res) => {
    try { 
        const groups = await groupsCollection.getAllGroups();
        res.json(groups);
    } catch(error) { 
        console.error("Error fetching groups", error);
        res.status(500).json({message: "Internal Server Error"})
    }
});

groupsRouter.post("/", requireRole("treasurer"), async (req, res) => { 
    try { 
        const { name } = req.body;
        if (!name) { 
            return res.status(400).json({ message: 'Group name is required '});
        }
        const result = await groupsCollection.createGroup({ name, createdBy: req.user._id});
        res.status(201).json(result);

    } catch(error) { 
        console.error("Error creating groups", error);
        res.status(500).json({message: "Internal Server Error"});

    }

});

// Starts a fresh semester: creates a new active group (new join code), then
// rolls the previous roster over — staff carry into the new group, members are
// detached to re-join, and the old term's pending dues are archived. No history
// is kept beyond the soft archive.
groupsRouter.post("/semester", requireRole("treasurer"), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "A semester name is required" });
        }

        // capture the outgoing semester before createGroup deactivates it.
        const previous = await groupsCollection.findActiveGroup();

        const result = await groupsCollection.createGroup({ name, createdBy: req.user._id });

        if (previous) {
            await usersCollection.rolloverGroupMembers(previous._id, result.id);
            await duesSubmissionsCollection.archivePendingForGroup(previous._id);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error("Error starting new semester", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Lets a member join the club by entering the active semester's join code. Only
// the active group's code works, so old-semester codes can't re-attach anyone.
groupsRouter.post("/join", isAuthenticated, async (req, res) => {
    try {
        const { joinCode } = req.body;
        if (!joinCode) {
            return res.status(400).json({ message: "A join code is required" });
        }

        const group = await groupsCollection.findGroupByJoinCode(joinCode.trim());
        if (!group || !group.active) {
            return res.status(404).json({ message: "That join code is not valid" });
        }

        const updated = await usersCollection.joinClub(req.user._id, group._id);
        if (!updated) {
            return res.status(400).json({ message: "Could not join the group" });
        }

        res.json({ groupId: group._id, groupName: group.name });
    } catch (error) {
        console.error("Error joining group", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

groupsRouter.get("/active", isAuthenticated, async (req, res) => {
    try {
        const group = await groupsCollection.findActiveGroup();
        if (!group) {
            return res.status(404).json({ message: "No active group" });
        }
        res.json(group);
    } catch (error) {
        console.error("Error fetching active group", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

groupsRouter.get("/:id", isAuthenticated, async (req, res) => {
    try {
        const group = await groupsCollection.findGroupById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.json(group);
    } catch (error) {
        console.error("Error fetching group", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

groupsRouter.put("/:id", requireRole("treasurer"), async (req, res) => {
    try {
        const { name, active } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (active !== undefined) updates.active = active;
        const updated = await groupsCollection.updateGroup(req.params.id, updates);
        if (!updated) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.json(updated);
    } catch (error) {
        console.error("Error updating group", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default groupsRouter;




