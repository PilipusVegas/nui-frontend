import { useState } from 'react';
import MobileLayout from '../../layouts/mobileLayout';

const Profile = () => {
    const [profileData, setProfileData] = useState({
        name: 'Pilipus',
        phone: '08900128222',
        division: 'IT',
        avatar: 'https://via.placeholder.com/150'
    });
    const currentPasswordFromServer = 'Admin#1234'; 
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(profileData);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const handleEdit = () => { setIsEditing(true); };
    const openPasswordModal = () => { setIsPasswordModalOpen(true); };
    const handleSave = () => { setIsEditing(false); setProfileData(editData); };
    const handleChange = (e) => { const { name, value } = e.target; setEditData({ ...editData, [name]: value }); };
    const handlePasswordChange = (e) => { const { name, value } = e.target; setPasswordData({ ...passwordData, [name]: value }); };
    const closePasswordModal = () => { setIsPasswordModalOpen(false); setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); };

    const handlePasswordSubmit = () => {
        const { currentPassword, newPassword, confirmNewPassword } = passwordData;
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('Please fill all fields');
            return;
        }
        if (currentPassword !== currentPasswordFromServer) {
            alert('Current password is incorrect');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match');
            return;
        }
        alert('Berhasil');
        closePasswordModal();
    };

    return (
        <MobileLayout title="PROFIL">
            <div style={styles.profileContainer}>
                <img src={profileData.avatar} alt="User Avatar" style={styles.avatar} />
                <div style={styles.profileInfo}>
                    <h2 style={styles.name}>{profileData.name}</h2>
                </div>
            </div>
            <div style={styles.details}>
                <div style={styles.detailRow}>
                    <p style={styles.detailLabel}><strong>Nama</strong></p>
                    <p style={styles.detailValue}>: {profileData.name}</p>
                </div>
                <div style={styles.detailRow}>
                    <p style={styles.detailLabel}><strong>Divisi</strong></p>
                    <p style={styles.detailValue}>: {profileData.division}</p>
                </div>
                <div style={styles.detailRow}>
                    <p style={styles.detailLabel}><strong>Nomor Telepon</strong></p>
                    {!isEditing ? (
                        <p style={styles.detailValue}>: {profileData.phone}</p>
                    ) : (
                        <input name="phone" type="text" style={styles.input} value={editData.phone} onChange={handleChange} />
                    )}
                </div>
            </div>
            <div style={styles.buttonContainer}>
                {!isEditing ? (
                    <button style={{ ...styles.button, ...styles.editButton }} onClick={handleEdit}>Edit</button>
                ) : (
                    <button style={{ ...styles.button, ...styles.saveButton }} onClick={handleSave}>Save</button>
                )}
                <button style={{ ...styles.button, ...styles.passwordButton }} onClick={openPasswordModal}>Change Password</button>
            </div>
            {isPasswordModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Change Password</h2>
                        <div style={styles.modalContent}>
                            <label style={styles.modalLabel}>Current Password</label>
                            <input type="password" name="currentPassword" style={styles.modalInput} value={passwordData.currentPassword} onChange={handlePasswordChange} />
                            <label style={styles.modalLabel}>New Password</label>
                            <input type="password" name="newPassword" style={styles.modalInput} value={passwordData.newPassword} onChange={handlePasswordChange} />
                            <label style={styles.modalLabel}>Confirm New Password</label>
                            <input type="password" name="confirmNewPassword" style={styles.modalInput} value={passwordData.confirmNewPassword} onChange={handlePasswordChange} />
                        </div>
                        <div style={styles.modalActions}>
                            <button style={styles.modalButton} onClick={handlePasswordSubmit}>Submit</button>
                            <button style={styles.modalCloseButton} onClick={closePasswordModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
};

const styles = {
    profileContainer: {
        display: 'flex',
        padding: '20px',
        alignItems: 'center',
        borderRadius: '10px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    avatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        marginRight: '20px',
    },
    profileInfo: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    name: {
        margin: '0',
        color: '#26413c',
        fontSize: '1.5rem',
    },
    details: {
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    detailRow: {
        display: 'grid',
        alignItems: 'center',
        marginBottom: '10px',
        gridTemplateColumns: '150px 1fr',
    },
    detailLabel: {
        color: '#333',
        fontSize: '1rem',
    },
    detailValue: {
        color: '#666',
        fontSize: '1rem',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    buttonContainer: {
        display: 'flex',
        marginTop: '20px',
        justifyContent: 'space-between',
    },
    button: {
        color: '#fff',
        border: 'none',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderRadius: '8px',
        padding: '12px 24px',
        backgroundColor: '#3e8e7e',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
    editButton: {
        alignSelf: 'flex-start',
    },
    passwordButton: {
        alignSelf: 'flex-end',
    },
    saveButton: {
        backgroundColor: '#26413c',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        width: '400px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    modalTitle: {
        color: '#333',
        fontSize: '1.5rem',
        margin: '0 0 20px',
        textAlign: 'center',
    },
    modalContent: {
        marginBottom: '20px',
    },
    modalLabel: {
        color: '#333',
        display: 'block',
        marginBottom: '5px',
    },
    modalInput: {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        border: '1px solid #ccc',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    modalButton: {
        color: '#fff',
        border: 'none',
        fontSize: '1rem',
        cursor: 'pointer',
        borderRadius: '5px',
        padding: '10px 20px',
        backgroundColor: '#3e8e7e',
    },
    modalCloseButton: {
        color: '#fff',
        border: 'none',
        fontSize: '1rem',
        cursor: 'pointer',
        borderRadius: '5px',
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
    },
};

export default Profile;
