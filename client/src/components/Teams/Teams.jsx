import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Teams.module.css';
import Sidebar from '../common/Sidebar';
import addIcon from '../../assets/images/Teams/circle-plus.png';
import deleteIcon from '../../assets/images/Teams/mdi_delete-outline.png';
import editIcon from '../../assets/images/Teams/ri_edit-line.png';
import sortIcon from '../../assets/images/Teams/chevrons-up-down.png';

const API_URL = process.env.REACT_APP_API_URL;

const Teams = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('teams');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    designation: 'team_member',
  });
  const [editMember, setEditMember] = useState({
    name: '',
    phone: '',
    designation: '',
  });
  const [deleteButtonRef, setDeleteButtonRef] = useState(null);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/users/team`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch team members');
        }

        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      } catch (err) {
        if (err.message.includes('Failed to fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else if (err.message.includes('Access denied')) {
          setError('You do not have permission to access this page.');
        } else {
          setError(err.message || 'Failed to fetch team members');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTeamMembers();
    }
  }, [token]);

  // Sort team members
  const filteredMembers = [...teamMembers].sort((a, b) => {
    const compareValue = a.name.localeCompare(b.name);
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Generate avatar based on name rules
  const getAvatarText = (name) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word: first + last letter
      const word = words[0];
      return (word.charAt(0) + word.charAt(word.length - 1)).toUpperCase();
    } else {
      // Multiple words: first letter of first + first letter of last
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle add member
  const handleAddMember = async () => {
    setError('');

    // Client-side validation
    if (!newMember.name || !newMember.name.trim()) {
      setError('Name is required');
      return;
    }

    if (newMember.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!newMember.email || !newMember.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(newMember.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMember),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add team member');
      }

      const data = await response.json();
      setTeamMembers([...teamMembers, data.user]);
      setShowAddModal(false);
      setNewMember({ name: '', email: '' });
      setError('');
      alert(`Team member added! Default password is: ${newMember.email}`);
    } catch (err) {
      if (err.message.includes('Email already exists')) {
        setError('This email is already registered. Please use a different email.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to add team member');
      }
    }
  };

  // Handle edit member
  const handleEditClick = (member) => {
    // Members can only edit themselves, admins can edit anyone
    if (!isAdmin && member._id !== user?.id) {
      alert('You can only edit your own profile');
      return;
    }
    
    setMemberToEdit(member);
    setEditMember({
      name: member.name,
      phone: member.phone || '',
      designation: member.designation || '',
    });
    setShowEditModal(true);
  };

  const handleEditMember = async () => {
    setError('');

    // Client-side validation
    if (!editMember.name || !editMember.name.trim()) {
      setError('Name is required');
      return;
    }

    if (editMember.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (editMember.phone && editMember.phone.trim().length > 0) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(editMember.phone)) {
        setError('Please enter a valid phone number');
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/users/team/${memberToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editMember),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit team member');
      }

      const data = await response.json();
      setTeamMembers(
        teamMembers.map((member) =>
          member._id === memberToEdit._id ? data.user : member
        )
      );
      setShowEditModal(false);
      setMemberToEdit(null);
      setEditMember({ name: '', phone: '', designation: '' });
      setError('');
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message.includes('Cannot edit admin')) {
        setError('Admin accounts cannot be edited.');
      } else {
        setError(err.message || 'Failed to edit team member');
      }
    }
  };

  // Handle delete member
  const handleDeleteClick = (member) => {
    // Prevent deleting admin
    if (member.role === 'admin') {
      alert('Cannot delete admin account');
      return;
    }
    setMemberToDelete(member);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(`${API_URL}/users/team/${memberToDelete._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete team member');
      }

      setTeamMembers(teamMembers.filter((member) => member._id !== memberToDelete._id));
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
      setError('');
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message.includes('Cannot delete admin')) {
        setError('Admin accounts cannot be deleted.');
      } else if (err.message.includes('Cannot delete your own account')) {
        setError('You cannot delete your own account.');
      } else {
        setError(err.message || 'Failed to delete team member');
      }
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setMemberToDelete(null);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {isAdmin ? 'Team' : 'Team'}
            </h1>
          </div>
        </header>

        {loading && <p className={styles.loadingText}>Loading team members...</p>}
        {error && <p className={styles.errorText}>{error}</p>}



        {/* Team Members Table */}
        {!loading && !error && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th className={styles.sortableHeader}>
                    <button 
                      className={styles.sortHeaderBtn}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      Full Name
                      <img src={sortIcon} alt="Sort" className={styles.sortHeaderIcon} />
                    </button>
                  </th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member._id}>
                    <td className={styles.avatarCell}>
                      <div className={styles.memberAvatar}>
                        {getAvatarText(member.name)}
                      </div>
                    </td>
                    <td className={styles.nameCell}>
                      <span className={styles.memberName}>{member.name}</span>
                    </td>
                    <td className={styles.phoneCell}>
                      {member.phone || '-'}
                    </td>
                    <td className={styles.emailCell}>{member.email}</td>
                    <td className={styles.roleCell}>
                      {member.role === 'team_member' ? 'Member' : member.role === 'admin' ? 'Admin' : member.role}
                    </td>
                    <td>
                      {isAdmin && (
                        <div className={styles.actionButtons}>
                          <>
                            <button
                              className={styles.editBtn}
                              onClick={() => handleEditClick(member)}
                              title="Edit"
                            >
                              <img src={editIcon} alt="Edit" className={styles.actionIcon} />
                            </button>
                            {member.role !== 'admin' && (
                              <button
                                ref={(el) => {
                                  if (memberToDelete?._id === member._id) {
                                    setDeleteButtonRef(el);
                                  }
                                }}
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteClick(member)}
                                title="Delete"
                              >
                                <img src={deleteIcon} alt="Delete" className={styles.actionIcon} />
                              </button>
                            )}
                          </>
                        </div>
                      )}
                      {!isAdmin && (
                        <div className={styles.actionButtons}>
                          {member._id === user?.id && (
                            <button
                              className={styles.editBtn}
                              onClick={() => handleEditClick(member)}
                              title="Edit"
                            >
                              <img src={editIcon} alt="Edit" className={styles.actionIcon} />
                            </button>
                          )}
                          {member._id !== user?.id && (
                            <span className={styles.readOnlyText}>—</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <p className={styles.emptyText}>No team members found</p>
            )}
          </div>
        )}

        {/* Add Team Member Button - Below Table */}
        {isAdmin && !loading && !error && (
          <div className={styles.addButtonContainer}>
            <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
              <img src={addIcon} alt="Add" className={styles.addIcon} />
              Add Team Member
            </button>
          </div>
        )}
      </main>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add Team members</h2>
            <p className={styles.modalDescription}>
              Talk with colleagues in a group chat. Messages in this group are only visible to its participants. New teammates may only be invited by the administrators.
            </p>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.formGroup}>
              <label className={styles.label}>User Name</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className={styles.input}
                placeholder="User name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email ID</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className={styles.input}
                placeholder="Email ID"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Designation</label>
              <select
                value={newMember.designation}
                onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                className={styles.input}
              >
                <option value="team_member">Member</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => {
                setShowAddModal(false);
                setError('');
              }}>
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleAddMember}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && memberToEdit && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Edit Team Member</h2>
            <p className={styles.modalDescription}>
              Update the team member's information
            </p>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                value={editMember.name}
                onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                className={styles.input}
                placeholder="Enter name (min 2 characters)"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input
                type="tel"
                value={editMember.phone}
                onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })}
                className={styles.input}
                placeholder="Enter phone number (optional)"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Designation</label>
              <input
                type="text"
                value={!isAdmin && memberToEdit?.role === 'team_member' ? 'Member' : editMember.designation}
                onChange={(e) => setEditMember({ ...editMember, designation: e.target.value })}
                className={styles.input}
                placeholder="Enter designation (optional)"
                disabled={!isAdmin && memberToEdit?.role === 'team_member'}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => {
                setShowEditModal(false);
                setError('');
              }}>
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleEditMember}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && memberToDelete && deleteButtonRef && (
        <div className={styles.deleteConfirmOverlay}>
          <div 
            className={styles.deleteConfirmModal} 
            onClick={(e) => e.stopPropagation()}
            style={{
              top: deleteButtonRef.getBoundingClientRect().bottom + 10,
              left: deleteButtonRef.getBoundingClientRect().right - 490,
            }}
          >
            <p className={styles.deleteConfirmMessage}>
              this teammate will be deleted.
            </p>
            <div className={styles.deleteConfirmActions}>
              <button className={styles.deleteConfirmCancelBtn} onClick={cancelDelete}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={confirmDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
