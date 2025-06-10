
import React from 'react';
import CodeEditor from '../components/CodeEditor';

const CodeEditorPanel = ({ language, code, onLanguageChange, onCodeChange }) => {

  return (
    //Setup for right side in problems/:id
    <div className="flex flex-col h-full"> 
      <div className="mb-2 px-4">
        <select
          className="select select-bordered w-48"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)} 
        >
          <option value="javascript">Javascript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
      </div>

     
      <div className="flex-1">
        <CodeEditor
          language={language} 
          value={code}      
          onChange={onCodeChange}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;