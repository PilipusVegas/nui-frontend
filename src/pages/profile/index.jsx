import { useState } from 'react';
import MobileLayout from '../../layouts/mobileLayout';

const Profile = () => {
    const [profileData, setProfileData] = useState({
        name: 'John Doe',
        phone: '+1234567890',
        division: 'Engineering',
        avatar: 'https://via.placeholder.com/150'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(profileData);

    const handleEdit = () => { setIsEditing(true); };
    const handleSave = () => { setIsEditing(false); setProfileData(editData); };
    const handleChange = (e) => { const { name, value } = e.target; setEditData({ ...editData, [name]: value }) };

    return (
        <MobileLayout title="PROFIL">
            <div style={styles.profileContainer}>
                <img src={profileData.avatar} alt="User Avatar" style={styles.avatar} />
                <div style={styles.profileInfo}>
                    <h2 style={styles.name}>{profileData.name}</h2>
                </div>
            </div>
            <div style={styles.details}>
                {!isEditing ? (
                    <>
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
                            <p style={styles.detailValue}>: {profileData.phone}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={styles.detailRow}>
                            <p style={styles.detailLabel}><strong>Nama</strong></p>
                            <input name="name" type="text" style={styles.input} value={editData.name} onChange={handleChange} />
                        </div>
                        <div style={styles.detailRow}>
                            <p style={styles.detailLabel}><strong>Divisi</strong></p>
                            <input name="division" type="text" style={styles.input} value={editData.division} onChange={handleChange} />
                        </div>
                        <div style={styles.detailRow}>
                            <p style={styles.detailLabel}><strong>Nomor Telepon</strong></p>
                            <input name="phone" type="text" style={styles.input} value={editData.phone} onChange={handleChange} />
                        </div>
                    </>
                )}
            </div>
            <div style={styles.buttonContainer}>
                {!isEditing ? (
                    <button style={styles.editButton} onClick={handleEdit}>Edit</button>
                ) : (
                    <button style={styles.saveButton} onClick={handleSave}>Save</button>
                )}
            </div>
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
    editButton: {
        color: '#fff',
        border: 'none',
        margin: '20px 0',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderRadius: '8px',
        padding: '12px 24px',
        backgroundColor: '#3e8e7e',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
    saveButton: {
        color: '#fff',
        border: 'none',
        fontSize: '1rem',
        margin: '20px 0',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderRadius: '8px',
        padding: '12px 24px',
        backgroundColor: '#26413c',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
    buttonContainer: {
        textAlign: 'right',
    },
};

styles.editButton[':hover'] = {
    transform: 'scale(1.05)',
    backgroundColor: '#2b6f66',
};

styles.saveButton[':hover'] = {
    transform: 'scale(1.05)',
    backgroundColor: '#1e3a34',
};

export default Profile;
