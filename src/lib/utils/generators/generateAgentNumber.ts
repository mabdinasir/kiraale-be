import db, { agencyAgent } from '@db';
import { eq, sql } from 'drizzle-orm';

/**
 * Generates a unique agent number for a user in an agency
 * Format: {AGENCY_PREFIX}{SEQUENCE_NUMBER}
 * Example: "ABC0001", "XYZ0025"
 *
 * @param agencyName - The name of the agency
 * @param agencyId - The ID of the agency
 * @returns Promise<string> - The generated agent number
 */
export const generateAgentNumber = async (
  agencyName: string,
  agencyId: string,
): Promise<string> => {
  // Get current agent count for this agency to generate next sequence number
  const agentCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agencyAgent)
    .where(eq(agencyAgent.agencyId, agencyId));

  // Generate agency prefix (first 3 characters of agency name, uppercase)
  const agencyPrefix = agencyName.substring(0, 3).toUpperCase();

  // Generate sequence number (zero-padded to 4 digits)
  const currentCount = agentCountResult[0]?.count ?? 0;
  const sequenceNumber = String(currentCount + 1).padStart(4, '0');

  return `${agencyPrefix}${sequenceNumber}`;
};
