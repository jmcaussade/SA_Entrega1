import React, { useState, useEffect } from 'react';

const AuthorForm = ({ fetchAuthors, editingAuthor, clearEditing }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (editingAuthor) {
      setName(editingAuthor.name);
    }
  }, [editingAuthor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authorData = { name };

    try {
      if (editingAuthor) {
        await fetch(`http://localhost:5000/api/authors/${editingAuthor._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...authorData, _rev: editingAuthor._rev }),
        });
      } else {
        await fetch('http://localhost:5000/api/authors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(authorData),
        });
      }

      fetchAuthors();
      clearForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const clearForm = () => {
    setName('');
    clearEditing();
  };

  return (
    <div>
      <h2>{editingAuthor ? 'Edit Author' : 'Add Author'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <button type="submit">{editingAuthor ? 'Update' : 'Add'}</button>
        {editingAuthor && <button type="button" onClick={clearForm}>Cancel</button>}
      </form>
    </div>
  );
};

export default AuthorForm;
