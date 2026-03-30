import React, { createContext, useState, useContext } from 'react';

const TalentContext = createContext();

export const useTalent = () => useContext(TalentContext);

export const TalentProvider = ({ children }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedCandidates, setUploadedCandidates] = useState([]);
  const [evaluations, setEvaluations] = useState({});

  const saveEvaluation = (candidateId, evaluation) => {
    setEvaluations(prev => ({
      ...prev,
      [candidateId]: evaluation
    }));
  };

  const clearAllData = () => {
    setJobDescription("");
    setUploadedCandidates([]);
    setEvaluations({});
  };

  return (
    <TalentContext.Provider value={{
      jobDescription,
      setJobDescription,
      uploadedCandidates,
      setUploadedCandidates,
      evaluations,
      saveEvaluation,
      clearAllData
    }}>
      {children}
    </TalentContext.Provider>
  );
};
