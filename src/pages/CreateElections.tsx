import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

interface Option {
  title: string;
  description: string;
}

interface DecodedToken {
  exp: number;
  id: number;
  email: string;
  role: string;
}

interface ApiErrorResponse {
  errors?: { msg: string }[];
  message?: string;
}

const CreateElections = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState<Option[]>([{ title: '', description: '' }]);
  const [errorMessage, setErrorMessage] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    console.log('Formulaire soumis:', { title, description, startDate, endDate, options });
    console.log('Token utilisé pour la requête:', token);

    if (!apiUrl) {
      console.error("L'URL de l'API n'est pas définie.");
      setErrorMessage("Erreur de configuration : l'URL de l'API est manquante.");
      return;
    }

    if (!token) {
      console.error("Aucun token disponible, l'utilisateur est peut-être non authentifié.");
      setErrorMessage("Vous devez être connecté pour créer une élection.");
      return;
    }

    if (!title || !description || !startDate || !endDate || options.length === 0) {
      console.error('Données manquantes, impossible de soumettre');
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (options.some(option => !option.title.trim() || !option.description.trim())) {
      console.error('Toutes les options doivent avoir un titre et une description non vides.');
      setErrorMessage('Veuillez remplir tous les champs des options correctement.');
      return;
    }

    const currentDate = new Date();
    const selectedStartDate = new Date(startDate);
    if (selectedStartDate < currentDate) {
      console.error('La date de début ne peut pas être dans le passé.');
      setErrorMessage('La date de début ne peut pas être dans le passé.');
      return;
    }

    if (options.length < 2) {
      console.error('Au moins 2 options sont requises.');
      setErrorMessage('Veuillez fournir au moins 2 options.');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.error('Le jeton a expiré.');
        setErrorMessage('Votre session a expiré. Veuillez vous reconnecter.');
        return;
      }
      console.log('Token décodé avec succès:', decoded);
    } catch (error) {
      console.error('Erreur lors de la vérification du jeton:', error);
      setErrorMessage('Token invalide. Veuillez vous reconnecter.');
      return;
    }

    try {
      // Format the dates to 'YYYY-MM-DD HH:MM:SS'
      const formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
      const formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
      console.log('Dates formatées:', { formattedStartDate, formattedEndDate });

      const response = await axios.post(
        `${apiUrl}/api/elections`,
        { title, description, startDate: formattedStartDate, endDate: formattedEndDate, options },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      console.log("Réponse de l'API:", response.data);
      alert('Élection créée avec succès !');
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setOptions([{ title: '', description: '' }]);
    } catch (error: unknown) {
      console.error('Erreur de requête API:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        console.error("Détails de l'erreur API:", axiosError.response?.data);
        if (axiosError.response?.data?.errors) {
          setErrorMessage(`Erreurs de validation: ${axiosError.response.data.errors.map(err => err.msg).join(', ')}`);
        } else {
          setErrorMessage(`Erreur: ${axiosError.response?.data?.message || "Échec de la création de l'élection"}`);
        }
      } else {
        setErrorMessage('Une erreur inattendue est survenue.');
      }
    }
  };

  const addOption = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Ajout d\'une nouvelle option');
    setOptions([...options, { title: '', description: '' }]);
  };

  const updateOption = (index: number, key: keyof Option, value: string) => {
    console.log(`Mise à jour de l'option ${index}:`, { key, value });
    const newOptions = [...options];
    newOptions[index][key] = value;
    setOptions(newOptions);
  };

  return (
    <motion.div className="min-h-screen pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Créer une élection</h1>
        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
        <div className="bg-black/30 p-6 rounded-xl border border-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Titre de l'élection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
              required
            />
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
              required
            />
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
              required
            />
            {options.map((option, index) => (
              <div key={index} className="flex flex-col gap-2 bg-gray-900 p-2 rounded">
                <input
                  type="text"
                  placeholder="Option"
                  value={option.title}
                  onChange={(e) => updateOption(index, 'title', e.target.value)}
                  className="p-2 rounded bg-gray-800 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Description de l'option"
                  value={option.description}
                  onChange={(e) => updateOption(index, 'description', e.target.value)}
                  className="p-2 rounded bg-gray-800 text-white"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="p-2 bg-blue-500 rounded text-white hover:bg-blue-700"
            >
              Ajouter une option
            </button>
            <button
              type="submit"
              className="p-2 bg-green-500 rounded text-white hover:bg-green-700"
            >
              Créer l'élection
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateElections;
