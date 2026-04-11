import { describe, expect, it } from "vitest";
import * as workerStore from "../src/modules/worker/async-store";

describe("worker db flow module", () => {
  it("exports expected worker functions", () => {
    expect(typeof workerStore.ensureAsyncTables).toBe("function");
    expect(typeof workerStore.enqueueJob).toBe("function");
    expect(typeof workerStore.processNextJob).toBe("function");
    expect(typeof workerStore.processNextOutboxEvent).toBe("function");
  });
});
