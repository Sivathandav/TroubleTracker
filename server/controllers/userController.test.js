const fc = require('fast-check');
const User = require('../models/User');
const {
  updateProfile,
  changePassword,
  getTeamMembers,
} = require('./userController');

// Mock User model
jest.mock('../models/User');

describe('Profile Management - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Feature: team-management, Property 4: Email Immutability**
   * **Validates: Requirements 3.2**
   * 
   * For any user attempting to modify their email address, the system SHALL prevent 
   * the change and display a message indicating email cannot be modified.
   */
  describe('Property 4: Email Immutability', () => {
    it('should prevent email modification in profile updates', async () => {
      const testData = fc.sample(
        fc.record({
          userId: fc.uuid(),
          originalEmail: fc.emailAddress(),
          firstName: fc.string({ minLength: 1, maxLength: 20 }),
          lastName: fc.string({ minLength: 1, maxLength: 20 }),
          phone: fc.string({ minLength: 1, maxLength: 20 }),
          designation: fc.string({ minLength: 1, maxLength: 20 }),
          newEmail: fc.emailAddress(),
        }),
        10
      );

      for (const data of testData) {
        // Skip if emails are the same
        if (data.newEmail === data.originalEmail) continue;

        // Setup mock user
        const mockUser = {
          _id: data.userId,
          email: data.originalEmail,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          designation: data.designation,
          save: jest.fn().mockResolvedValue(true),
        };

        User.findById.mockResolvedValue(mockUser);

        // Create mock request/response
        const req = {
          user: { id: data.userId },
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            designation: data.designation,
            email: data.newEmail, // Attempt to change email
          },
        };

        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        await updateProfile(req, res);

        // Verify email modification was rejected
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Email cannot be modified',
          })
        );
      }
    });
  });

  /**
   * **Feature: team-management, Property 5: Password Change Logout**
   * **Validates: Requirements 3.4, 3.5**
   * 
   * For any user who changes their password, the system SHALL log them out and 
   * redirect them to the login page.
   */
  describe('Property 5: Password Change Logout', () => {
    it('should return requiresLogout flag on successful password change', async () => {
      const testData = fc.sample(
        fc.record({
          userId: fc.uuid(),
          currentPassword: fc.string({ minLength: 6, maxLength: 20 }),
          newPassword: fc.string({ minLength: 6, maxLength: 20 }),
        }),
        10
      );

      for (const data of testData) {
        // Setup mock user
        const mockUser = {
          _id: data.userId,
          password: 'hashedPassword',
          comparePassword: jest.fn().mockResolvedValue(true),
          save: jest.fn().mockResolvedValue(true),
        };

        User.findById.mockResolvedValue(mockUser);

        // Create mock request/response
        const req = {
          user: { id: data.userId },
          body: {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          },
        };

        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        await changePassword(req, res);

        // Verify response includes requiresLogout flag
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            requiresLogout: true,
          })
        );
      }
    });
  });

  /**
   * **Feature: team-management, Property 7: Member Self-Edit**
   * **Validates: Requirements 3.1**
   * 
   * For any member accessing their own profile, the system SHALL allow editing of 
   * first name, last name, phone, and designation fields.
   */
  describe('Property 7: Member Self-Edit', () => {
    it('should allow editing of firstName, lastName, phone, and designation', async () => {
      const testData = fc.sample(
        fc.record({
          userId: fc.uuid(),
          firstName: fc.string({ minLength: 1, maxLength: 20 }),
          lastName: fc.string({ minLength: 1, maxLength: 20 }),
          phone: fc.string({ minLength: 1, maxLength: 20 }),
          designation: fc.string({ minLength: 1, maxLength: 20 }),
        }),
        10
      );

      for (const data of testData) {
        // Setup mock user
        const mockUser = {
          _id: data.userId,
          name: 'John Doe',
          email: 'john@example.com',
          firstName: '',
          lastName: '',
          phone: '',
          designation: '',
          save: jest.fn().mockResolvedValue(true),
        };

        User.findById.mockResolvedValue(mockUser);

        // Create mock request/response
        const req = {
          user: { id: data.userId },
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            designation: data.designation,
          },
        };

        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        await updateProfile(req, res);

        // Verify all fields were updated
        expect(mockUser.firstName).toBe(data.firstName);
        expect(mockUser.lastName).toBe(data.lastName);
        expect(mockUser.phone).toBe(data.phone);
        expect(mockUser.designation).toBe(data.designation);
        expect(mockUser.save).toHaveBeenCalled();
      }
    });
  });
});


/**
 * **Feature: team-management, Property 9: Sorting Consistency**
 * **Validates: Requirements 2.4, 2.5**
 * 
 * For any team roster display, sorting by name or email SHALL maintain 
 * consistent ordering across multiple sort operations.
 */
describe('Team Roster Sorting - Property 9: Sorting Consistency', () => {
  /**
   * Helper function to sort team members by name
   */
  const sortByName = (members, order = 'asc') => {
    const sorted = [...members].sort((a, b) => {
      const compareValue = a.name.localeCompare(b.name);
      return order === 'asc' ? compareValue : -compareValue;
    });
    return sorted;
  };

  /**
   * Helper function to sort team members by email
   */
  const sortByEmail = (members, order = 'asc') => {
    const sorted = [...members].sort((a, b) => {
      const compareValue = a.email.localeCompare(b.email);
      return order === 'asc' ? compareValue : -compareValue;
    });
    return sorted;
  };

  /**
   * Property: Sorting by name is idempotent
   * Applying the sort twice should produce the same result as applying it once
   */
  it('should maintain consistent name sorting across multiple operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            _id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('admin', 'team_member'),
            designation: fc.string({ minLength: 0, maxLength: 30 }),
            phone: fc.string({ minLength: 0, maxLength: 20 }),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (members) => {
          // Sort once
          const sortedOnce = sortByName(members, 'asc');
          // Sort again
          const sortedTwice = sortByName(sortedOnce, 'asc');

          // Both should be identical
          expect(sortedTwice).toEqual(sortedOnce);

          // Verify the order is correct (each element should be <= next element)
          for (let i = 0; i < sortedOnce.length - 1; i++) {
            const comparison = sortedOnce[i].name.localeCompare(sortedOnce[i + 1].name);
            expect(comparison).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting by email is idempotent
   * Applying the sort twice should produce the same result as applying it once
   */
  it('should maintain consistent email sorting across multiple operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            _id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('admin', 'team_member'),
            designation: fc.string({ minLength: 0, maxLength: 30 }),
            phone: fc.string({ minLength: 0, maxLength: 20 }),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (members) => {
          // Sort once
          const sortedOnce = sortByEmail(members, 'asc');
          // Sort again
          const sortedTwice = sortByEmail(sortedOnce, 'asc');

          // Both should be identical
          expect(sortedTwice).toEqual(sortedOnce);

          // Verify the order is correct (each element should be <= next element)
          for (let i = 0; i < sortedOnce.length - 1; i++) {
            const comparison = sortedOnce[i].email.localeCompare(sortedOnce[i + 1].email);
            expect(comparison).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Descending sort is consistent
   * Applying descending sort twice should produce the same result
   */
  it('should maintain consistent descending name sorting', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            _id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('admin', 'team_member'),
            designation: fc.string({ minLength: 0, maxLength: 30 }),
            phone: fc.string({ minLength: 0, maxLength: 20 }),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (members) => {
          // Sort descending once
          const sortedOnce = sortByName(members, 'desc');
          // Sort descending again
          const sortedTwice = sortByName(sortedOnce, 'desc');

          // Both should be identical
          expect(sortedTwice).toEqual(sortedOnce);

          // Verify the order is correct (each element should be >= next element)
          for (let i = 0; i < sortedOnce.length - 1; i++) {
            const comparison = sortedOnce[i].name.localeCompare(sortedOnce[i + 1].name);
            expect(comparison).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toggling sort order produces inverse ordering
   * Sorting ascending then descending should reverse the order
   */
  it('should produce inverse ordering when toggling sort direction', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            _id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('admin', 'team_member'),
            designation: fc.string({ minLength: 0, maxLength: 30 }),
            phone: fc.string({ minLength: 0, maxLength: 20 }),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (members) => {
          const sortedAsc = sortByName(members, 'asc');
          const sortedDesc = sortByName(members, 'desc');

          // Reverse the ascending sort should equal descending sort
          const reversedAsc = [...sortedAsc].reverse();
          expect(reversedAsc).toEqual(sortedDesc);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: team-management, Property 8: Team Roster Visibility**
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * For any member viewing the team roster, the system SHALL display all team 
 * members' information (name, email, role, designation) in read-only format.
 */
describe('Team Roster Visibility - Property 8: Team Roster Visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all team members with required fields for roster display', async () => {
    // Generate test data
    const testCases = fc.sample(
      fc.array(
        fc.record({
          _id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('admin', 'team_member'),
          designation: fc.string({ minLength: 0, maxLength: 30 }),
          phone: fc.string({ minLength: 0, maxLength: 20 }),
        }),
        { minLength: 1, maxLength: 50 }
      ),
      10
    );

    for (const members of testCases) {
      jest.clearAllMocks();

      // Mock User.find to return all members with proper chaining
      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(members),
        }),
      });

      // Create mock request/response
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getTeamMembers(req, res);

      // Verify response structure
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: members.length,
          teamMembers: expect.any(Array),
        })
      );

      // Verify all members are returned
      const returnedMembers = res.json.mock.calls[0][0].teamMembers;
      expect(returnedMembers).toHaveLength(members.length);

      // Verify each member has required fields for roster display
      for (const member of returnedMembers) {
        expect(member).toHaveProperty('name');
        expect(member).toHaveProperty('email');
        expect(member).toHaveProperty('role');
        expect(member).toHaveProperty('designation');
      }
    }
  });

  it('should include all users regardless of role in team roster', async () => {
    const testMembers = [
      {
        _id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        designation: 'Administrator',
        phone: '123-456-7890',
      },
      {
        _id: 'member-1',
        name: 'Team Member 1',
        email: 'member1@example.com',
        role: 'team_member',
        designation: 'Support Agent',
        phone: '123-456-7891',
      },
      {
        _id: 'member-2',
        name: 'Team Member 2',
        email: 'member2@example.com',
        role: 'team_member',
        designation: 'Support Agent',
        phone: '123-456-7892',
      },
    ];

    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(testMembers),
      }),
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTeamMembers(req, res);

    // Verify all members are returned
    const returnedMembers = res.json.mock.calls[0][0].teamMembers;
    expect(returnedMembers).toHaveLength(3);

    // Verify both admin and team members are included
    const roles = returnedMembers.map((m) => m.role);
    expect(roles).toContain('admin');
    expect(roles).toContain('team_member');
  });
});
