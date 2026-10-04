import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ContainerSnapshotManager } from "./snapshot.ts";

describe("Container Snapshot & Rapid Boot Pipeline", () => {
  it("initializes with pre-cached base Git 2.56 snapshot metadata", () => {
    const manager = new ContainerSnapshotManager();
    const snapshots = manager.listSnapshots();
    assert.ok(snapshots.length >= 1);

    const base = manager.getSnapshot("berth-base-v1");
    assert.ok(base);
    assert.equal(base.name, "berth-base-v1");
    assert.equal(base.gitVersion, "2.56.0");
    assert.equal(base.restoreTimeTargetMs, 2000);
    assert.ok(base.toolsPrecached.includes("git 2.56"));
  });

  it("restores attempt container sandbox in <= 2000ms", async () => {
    const manager = new ContainerSnapshotManager();
    const restored = await manager.restoreContainerFromSnapshot("berth-base-v1", {
      attemptId: "att-perf-test",
      instance: "standard-1"
    });

    assert.ok(restored.containerId.includes("att-perf-test"));
    assert.equal(restored.ready, true);
    assert.ok(restored.bootDurationMs <= 2000, `Boot duration ${restored.bootDurationMs}ms exceeded 2000ms target`);

    // Verify pre-cached Git version inside restored container
    const versionOutput = await restored.exec(["git", "--version"]);
    assert.ok(versionOutput.stdout.includes("git version 2.56.0"));
    assert.equal(versionOutput.exitCode, 0);
  });

  it("creates custom container snapshots with unique snapshot IDs", async () => {
    const manager = new ContainerSnapshotManager();
    const snap = await manager.snapshotContainer(null, "berth-custom-v2");

    assert.equal(snap.name, "berth-custom-v2");
    assert.ok(snap.snapshotId.startsWith("snap-berth-custom-v2-"));
    assert.equal(manager.listSnapshots().length, 2);
  });
});
