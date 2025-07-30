import React, { useState, useEffect } from 'react';
import { getContacts, getContactDocuments, uploadContactDocument } from '../api';
import './Contacts.css';
import { FaPen, FaUser, FaBuilding } from 'react-icons/fa';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [filesById, setFilesById] = useState({});
  const [docsById, setDocsById]     = useState({});
  const [openId, setOpenId]         = useState(null);
  const [uploadSuccessById, setUploadSuccessById] = useState({});
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [clientType, setClientType] = useState('individual');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', companyName: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showInlineEdit, setShowInlineEdit] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', companyName: '', notes: '', type: 'individual' });
  const [editFormError, setEditFormError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    getContacts().then(r => setContacts(r.data));
  }, []);

  const handleFileChange = (id, files) => {
    setFilesById(f => ({ ...f, [id]: files }));
  };

  const handleUpload = async (id) => {
    const files = filesById[id];
    if (!files) return alert('Select files first');
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('documents', f));
    await uploadContactDocument(id, fd);
    if (openId === id) loadDocs(id);
    setUploadSuccessById(s => ({ ...s, [id]: true }));
    setTimeout(() => setUploadSuccessById(s => ({ ...s, [id]: false })), 2000);
  };

  const loadDocs = async (id) => {
    const res = await getContactDocuments(id);
    setDocsById(d => ({ ...d, [id]: res.data }));
  };

  const toggleDetails = async (id) => {
    if (openId === id) setOpenId(null);
    else { await loadDocs(id); setOpenId(id) }
  };

  const openModal = () => {
    setForm({ firstName: '', lastName: '', email: '', mobile: '', companyName: '', notes: '' });
    setFormError('');
    setClientType('individual');
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setFormError('');
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.mobile.trim() || (clientType === 'individual' && !form.firstName.trim())) {
      setFormError('Please fill all required fields.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          type: clientType,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          mobile: form.mobile,
          companyName: form.companyName,
          notes: form.notes,
        }),
      });
      if (!res.ok) {
        let errorMsg = 'Failed to add client.';
        try {
          const data = await res.json();
          if (data && data.error) errorMsg = data.error;
        } catch {}
        setFormError(errorMsg);
        setSaving(false);
        return;
      }
      closeModal();
      // Refresh contacts
      getContacts().then(r => setContacts(r.data));
    } catch (err) {
      setFormError('Failed to add client.');
    } finally {
      setSaving(false);
    }
  };

  const openInlineEdit = (contact) => {
    setSelectedContactForEdit(contact);
    setEditForm({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      mobile: contact.mobile || '',
      companyName: contact.companyName || '',
      notes: contact.notes || '',
      type: contact.type || 'individual',
    });
    setEditFormError('');
    setShowInlineEdit(true);
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditFormError('');
    if (!editForm.mobile.trim() || (editForm.type === 'individual' && !editForm.firstName.trim())) {
      setEditFormError('Please fill all required fields.');
      return;
    }
    setEditSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contacts/${selectedContactForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          type: editForm.type,
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          email: editForm.email,
          mobile: editForm.mobile,
          companyName: editForm.companyName,
          notes: editForm.notes,
        }),
      });
      if (!res.ok) {
        let errorMsg = 'Failed to update client.';
        try {
          const data = await res.json();
          if (data && data.error) errorMsg = data.error;
        } catch {}
        setEditFormError(errorMsg);
        setEditSaving(false);
        return;
      }
      setShowInlineEdit(false);
      // Refresh contacts
      getContacts().then(r => setContacts(r.data));
    } catch (err) {
      setEditFormError('Failed to update client.');
    } finally {
      setEditSaving(false);
    }
  };

  // Filtered and searched contacts
  const filteredContacts = contacts.filter(c => {
    // Filter by type
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    // Concatenate all searchable fields
    const concat = [
      c.firstName,
      c.lastName,
      c.email,
      c.mobile,
      c.companyName,
      c.notes,
      c.type
    ].filter(Boolean).join(' ').toLowerCase();
    return concat.includes(search.toLowerCase());
  });

  return (
    <div className="contacts-list">
      <div className="contacts-page-header">
        <div className="contacts-title-section">
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage your contacts and documents</p>
        </div>
        <button className="add-contact-btn" onClick={openModal}>+ Add Contact</button>
      </div>

      {showInlineEdit && selectedContactForEdit && (
        <div className="inline-edit-form">
          <h2>Edit Contact</h2>
          <form onSubmit={handleEditSave} className="edit-contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={editForm.type} onChange={handleEditFormChange}>
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="form-group">
                <label>First Name *</label>
                <input name="firstName" value={editForm.firstName} onChange={handleEditFormChange} required />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input name="mobile" value={editForm.mobile} onChange={handleEditFormChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Last Name</label>
                <input name="lastName" value={editForm.lastName} onChange={handleEditFormChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={editForm.email} onChange={handleEditFormChange} type="email" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input name="notes" value={editForm.notes} onChange={handleEditFormChange} />
              </div>
            </div>
            {editFormError && <div className="form-error">{editFormError}</div>}
            <div className="form-actions">
              <button type="submit" className="update-btn" disabled={editSaving}>
                {editSaving ? 'Updating...' : 'Update Contact'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowInlineEdit(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="contacts-controls-row">
        <input
          className="search-input"
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="type-filter"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
        </select>
      </div>
      {filteredContacts.map(c => (
        <div key={c.id} className="contact-card">
          <div className="contact-card-main">
            <div className="contact-avatar">
              {c.type === 'business' ? (
                <FaBuilding className="avatar-icon business" />
              ) : (
                <FaUser className="avatar-icon individual" />
              )}
            </div>
            <div className="contact-info">
              <div className="contact-header">
                <h3 className="contact-name">
                  {c.type === 'business' && c.companyName ? c.companyName : `${c.firstName} ${c.lastName}`.trim()}
                </h3>
                <span className="contact-type-badge">{c.type}</span>
              </div>
              <div className="contact-details">
                <span className="contact-email">{c.email}</span>
                <span className="contact-mobile">{c.mobile}</span>
              </div>
            </div>
            <button 
              className="edit-contact-btn" 
              onClick={() => openInlineEdit(c)}
            >
              <FaPen /> Edit
            </button>
          </div>
        </div>
      ))}
      {/* Modal for Add Client */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="client-type-tabs">
              <button type="button" className={clientType === 'individual' ? 'tab active' : 'tab'} onClick={() => setClientType('individual')}>Individual</button>
              <button type="button" className={clientType === 'business' ? 'tab active' : 'tab'} onClick={() => setClientType('business')}>Business</button>
            </div>
            <h2>Add New Client</h2>
            <form onSubmit={handleSave} className="add-client-form">
              {clientType === 'individual' && (
                <>
                  <div className="form-group required">
                    <label>First Name<span>*</span></label>
                    <input name="firstName" value={form.firstName} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleFormChange} />
                  </div>
                </>
              )}
              {clientType === 'business' && (
                <div className="form-group required">
                  <label>Company Name<span>*</span></label>
                  <input name="companyName" value={form.companyName} onChange={handleFormChange} required />
                </div>
              )}
              <div className="form-group required">
                <label>Mobile<span>*</span></label>
                <input name="mobile" value={form.mobile} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleFormChange} type="email" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input name="notes" value={form.notes} onChange={handleFormChange} />
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn" disabled={saving}>{saving ? 'Saving...' : 'Create Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
