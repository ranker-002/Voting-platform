export interface User {
  id: string;
  email: string;
  role: 'admin' | 'voter';
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'closed';
  options: ElectionOption[];
}

export interface ElectionOption {
  id: string;
  title: string;
  description: string;
  voteCount: number;
}

export interface Vote {
  id: string;
  electionId: string;
  userId: string;
  optionId: string;
  timestamp: string;
}
export interface VoteHistory {
  election_id: string;
  election_title: string;
  status: string;
  voted_option: string;
  vote_date: string;
}
export interface VoteResult {
  id: string;
  title: string;
  vote_count: number;
  percentage: number;
}


export interface ApiResponse {
  results: VoteResult[];
  totalVoters: number;
}