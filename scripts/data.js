const BASE_URL = 'https://notes-api.dicoding.dev/v2';

const emitLoadingState = (isLoading) => {
  document.dispatchEvent(
    new CustomEvent('api-loading', {
      detail: { isLoading },
    })
  );
};

const emitError = (error) => {
  document.dispatchEvent(
    new CustomEvent('api-error', {
      detail: {
        message: error.message || 'Terjadi kesalahan pada server',
        code: error.code || 500,
      },
    })
  );
};

const fetchWrapper = async (url, options = {}) => {
  emitLoadingState(true);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = new Error(response.statusText);
      error.code = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    emitError(error);
    throw error;
  } finally {
    emitLoadingState(false);
  }
};

// API Functions
export const getActiveNotes = async () => {
  try {
    const { data } = await fetchWrapper(`${BASE_URL}/notes`);
    return data;
  } catch {
    return []; 
  }
};

export const getArchivedNotes = async () => {
  try {
    const { data } = await fetchWrapper(`${BASE_URL}/notes/archived`);
    return data;
  } catch {
    return [];
  }
};

export const addNote = async ({ title, body }) => {
  const { data } = await fetchWrapper(`${BASE_URL}/notes`, {
    method: 'POST',
    body: JSON.stringify({ title, body }),
  });
  return data;
};

export const archiveNote = async (id) => {
  await fetchWrapper(`${BASE_URL}/notes/${id}/archive`, {
    method: 'POST',
  });
};

export const unarchiveNote = async (id) => {
  await fetchWrapper(`${BASE_URL}/notes/${id}/unarchive`, {
    method: 'POST',
  });
};

export const deleteNote = async (id) => {
  await fetchWrapper(`${BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });
};

export const simulateDelay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
