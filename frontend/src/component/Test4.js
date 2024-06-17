import React, { useState } from 'react';
import axios from 'axios';

const PunctuationFixer = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handlePunctuationFix = async () => {
    setLoading(true);

    const apiToken = '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';  // Replace with your Hugging Face API token
    const apiUrl = 'https://api-inference.huggingface.co/models/oliverguhr/fullstop-punctuation-multilang-large';

    try {
      const response = await axios.post(apiUrl, {
        inputs: inputText,
      }, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });

      const result = response.data[0].generated_text;
      setCorrectedText(result);
    } catch (error) {
      console.error('Error punctuating text:', error);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Text Punctuation Corrector</h2>
      <textarea
        value={inputText}
        onChange={handleChange}
        rows="4"
        cols="50"
        placeholder="Enter text without proper punctuation..."
      ></textarea>
      <br />
      <button onClick={handlePunctuationFix} disabled={loading}>
        {loading ? 'Fixing...' : 'Fix Punctuation'}
      </button>
      <h3>Corrected Text:</h3>
      <p>{correctedText}</p>
    </div>
  );
};

export default PunctuationFixer;
