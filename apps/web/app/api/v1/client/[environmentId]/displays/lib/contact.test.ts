import { describe, expect, test, vi } from "vitest";
import { prisma } from "@formbricks/database";
import { getContactByUserId } from "./contact";

vi.mock("@formbricks/database", () => ({
  prisma: {
    contact: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    cache: vi.fn((fn: Function) => fn),
  };
});

const environmentId = "test-environment-id";
const userId = "test-user-id";
const contact = {
  id: "test-contact-id",
  createdAt: new Date(),
  updatedAt: new Date(),
  environmentId,
};

describe("getContactByUserId", () => {
  test("returns the first contact whose userId attribute exactly matches in the environment", async () => {
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(contact);

    const result = await getContactByUserId(environmentId, userId);

    expect(prisma.contact.findFirst).toHaveBeenCalledWith({
      where: {
        attributes: {
          some: {
            attributeKey: {
              key: "userId",
              environmentId,
            },
            value: userId,
          },
        },
      },
      select: { id: true },
    });
    expect(result).toEqual(contact);
  });

  test("returns null when no contact matches", async () => {
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

    const result = await getContactByUserId(environmentId, userId);

    expect(result).toBeNull();
  });
});
