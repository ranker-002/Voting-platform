import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ApiResponse, VoteHistory, VoteResult } from '../types';

const VoteResultsHistory = () => {
  const { token } = useAuth();
  const { electionId } = useParams();
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [history, setHistory] = useState<VoteHistory[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log("🛠️ useEffect exécuté !");
    console.log("🔑 Token utilisé :", token);
    console.log("📌 Election ID récupéré :", electionId);

    if (!electionId) {
      console.error("❌ Aucun electionId trouvé, arrêt du fetch");
      return;
    }

    const fetchResultsAndHistory = async () => {
      try {
        // Récupérer tous les résultats des votes
        const resultsResponse = await axios.get(`http://localhost:5000/api/votes/results/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('✅ Global election results:', resultsResponse.data);
        setResults(resultsResponse.data);
  
        // Récupérer l'historique de vote de l'utilisateur
        const historyResponse = await axios.get(`http://localhost:5000/api/votes/history`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        console.log('📜 Voting history response:', historyResponse.data);
        setHistory(historyResponse.data);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setErrorMessage('Failed to fetch data. Please try again later.');
      }
    };
  
    fetchResultsAndHistory();
  }, [token, electionId]);
  
  if (!results) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Global Voting Results and History</h1>
        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
        
        <div className="bg-black/30 p-6 rounded-xl border border-gray-800 mb-8">
          <h2 className="text-2xl font-semibold mb-4">All Election Results</h2>
          {results.results.length > 0 ? (
            <ul>
              {results.results.map((result: VoteResult) => (
                <li key={result.id} className="mb-4">
                  <h3 className="text-xl font-semibold">{result.title}</h3>
                  <p>Votes: {result.vote_count}</p>
                  <p>Percentage: {result.percentage?.toFixed(2)}%</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No results available.</p>
          )}
          <p>Total Voters: {results.totalVoters}</p>
        </div>

        <div className="bg-black/30 p-6 rounded-xl border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Your Voting History</h2>
          {history.length > 0 ? (
            <ul>
              {history.map((vote: VoteHistory) => (
                <li key={vote.election_id} className="mb-4">
                  <h3 className="text-xl font-semibold">{vote.election_title}</h3>
                  <p>Status: {vote.status}</p>
                  <p>Voted Option: {vote.voted_option}</p>
                  <p>Vote Date: {new Date(vote.vote_date).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No voting history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoteResultsHistory;
