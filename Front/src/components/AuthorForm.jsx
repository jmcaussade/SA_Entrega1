import React, { useState, useEffect } from 'react';

const AuthorForm = ({ fetchAuthors, editingAuthor, clearEditing }) => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingAuthor) {
      setName(editingAuthor.name);
      setDateOfBirth(editingAuthor.date_of_birth);
      setCountryOfOrigin(editingAuthor.country_of_origin);
      setDescription(editingAuthor.description);
    }
  }, [editingAuthor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authorData = { 
      name, 
      date_of_birth: dateOfBirth, 
      country_of_origin: countryOfOrigin, 
      description 
    };

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
          body: JSON.stringify({ type: 'author', ...authorData }),
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
    setDateOfBirth('');
    setCountryOfOrigin('');
    setDescription('');
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
        <label>
          Date of Birth:
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </label>
        <label>
          Country of Origin:
          <input
            type="text"
            value={countryOfOrigin}
            onChange={(e) => setCountryOfOrigin(e.target.value)}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button type="submit">{editingAuthor ? 'Update' : 'Add'}</button>
        {editingAuthor && <button type="button" onClick={clearForm}>Cancel</button>}
      </form>
    </div>
  );
};

export default AuthorForm;
