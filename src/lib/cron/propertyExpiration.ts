import db, { property, user } from '@db';
import { logError, propertyExpiredTemplate, sendEmail } from '@lib';
import { and, eq, lt } from 'drizzle-orm';
import cron from 'node-cron';

// Run daily at 2 AM to expire properties
export const setupPropertyExpirationCron = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      const now = new Date();

      // Find properties that need to be expired with owner details for email
      const propertiesToExpire = await db
        .select({
          property: {
            id: property.id,
            title: property.title,
            expiresAt: property.expiresAt,
            createdAt: property.createdAt,
          },
          owner: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        })
        .from(property)
        .innerJoin(user, eq(property.userId, user.id))
        .where(and(eq(property.status, 'AVAILABLE'), lt(property.expiresAt, now)));

      if (propertiesToExpire.length === 0) {
        return; // No properties to expire
      }

      // Update properties to EXPIRED status
      const expiredPropertyIds = propertiesToExpire.map((propertyData) => propertyData.property.id);
      await db
        .update(property)
        .set({
          status: 'EXPIRED',
          updatedAt: now,
        })
        .where(and(eq(property.status, 'AVAILABLE'), lt(property.expiresAt, now)));

      // Send expiration emails to property owners in parallel
      let emailsSent = 0;

      // Check if email service is configured
      if (process.env.NODE_MAILER_EMAIL) {
        // Create email promises for parallel execution
        const emailPromises = propertiesToExpire.map(async (propertyData) => {
          try {
            // Calculate days since property was active
            const daysSinceActive = propertyData.property.expiresAt
              ? Math.ceil(
                  (now.getTime() -
                    new Date(propertyData.property.expiresAt).getTime() -
                    30 * 24 * 60 * 60 * 1000) /
                    (24 * 60 * 60 * 1000),
                ) + 30
              : 30;

            const emailTemplate = propertyExpiredTemplate(
              propertyData.property.title,
              `${propertyData.owner.firstName} ${propertyData.owner.lastName}`,
              daysSinceActive,
            );

            await sendEmail(
              process.env.NODE_MAILER_EMAIL ?? '',
              propertyData.owner.email,
              emailTemplate.subject,
              emailTemplate.text,
              emailTemplate.html,
            );

            return { success: true, propertyId: propertyData.property.id };
          } catch (emailError) {
            logError(
              `Failed to send expiration email for property ${propertyData.property.id} to ${propertyData.owner.email}: ${(emailError as Error).message}`,
              'PROPERTY_EXPIRATION_EMAIL_ERROR',
            );
            return { success: false, propertyId: propertyData.property.id, error: emailError };
          }
        });

        // Send all emails in parallel
        const emailResults = await Promise.allSettled(emailPromises);
        emailsSent = emailResults.filter(
          (result) => result.status === 'fulfilled' && result.value.success,
        ).length;
      } else {
        logError(
          'Email service not configured - cannot send property expiration notifications',
          'PROPERTY_EXPIRATION_EMAIL_CONFIG',
        );
      }

      // Log successful expiration action
      logError(
        `Property expiration cron: Expired ${propertiesToExpire.length} properties (${emailsSent} emails sent) - IDs: ${expiredPropertyIds.join(', ')}`,
        'PROPERTY_EXPIRATION_CRON',
      );
    } catch (error) {
      logError(
        `Failed to expire properties: ${(error as Error).message}`,
        'PROPERTY_EXPIRATION_CRON_ERROR',
      );
    }
  });
};
