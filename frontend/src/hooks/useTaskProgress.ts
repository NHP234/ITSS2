import { useState, useEffect, useCallback } from 'react';

const TASK_PROGRESS_STORAGE_KEY = 'taskProgress';

// Load all progress for all projects
const loadAllProgress = (): Record<string, Record<string, number>> => {
  try {
    const allData: Record<string, Record<string, number>> = {};
    // Iterate through localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('taskProgress_')) {
        const projectId = key.replace('taskProgress_', '');
        const data = localStorage.getItem(key);
        if (data) {
          allData[projectId] = JSON.parse(data);
        }
      }
    }
    return allData;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return {};
  }
};

// Save progress for a specific project
const saveProjectProgress = (projectId: string, progress: Record<string, number>) => {
  try {
    const storageKey = `taskProgress_${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export function useTaskProgress() {
  const [allProgress, setAllProgress] = useState<Record<string, Record<string, number>>>(() => loadAllProgress());

  // Get progress for a specific task
  const getTaskProgress = useCallback((projectId: string, taskId: string, taskStatus?: string): number => {
    const projectProgress = allProgress[projectId];
    if (projectProgress && projectProgress[taskId] !== undefined) {
      return projectProgress[taskId];
    }
    // Default: 100 if Done, otherwise 0
    return taskStatus === 'Done' ? 100 : 0;
  }, [allProgress]);

  // Set progress for a specific task
  const setTaskProgress = useCallback((projectId: string, taskId: string, progress: number) => {
    setAllProgress(prev => {
      const currentProjectProgress = prev[projectId] || {};
      const newProjectProgress = {
        ...currentProjectProgress,
        [taskId]: progress
      };
      
      // Save to localStorage
      saveProjectProgress(projectId, newProjectProgress);
      
      return {
        ...prev,
        [projectId]: newProjectProgress
      };
    });
  }, []);

  // Calculate project completion percentage
  const getProjectCompletion = useCallback((projectId: string, tasks: any[]): number => {
    const projectProgress = allProgress[projectId] || {};
    
    if (tasks.length === 0) return 0;
    
    let totalWeightedProgress = 0;
    let totalWeight = 0;
    
    tasks.forEach(task => {
      const weight = task.weight || 1;
      totalWeight += weight;
      
      const progress = projectProgress[task.id] ?? (task.status === 'Done' ? 100 : 0);
      totalWeightedProgress += (progress / 100) * weight;
    });
    
    return totalWeight > 0 ? Math.round((totalWeightedProgress / totalWeight) * 100) : 0;
  }, [allProgress]);

  // Clear progress for a task
  const clearTaskProgress = useCallback((projectId: string, taskId: string) => {
    setAllProgress(prev => {
      const currentProjectProgress = prev[projectId] || {};
      const { [taskId]: _, ...remaining } = currentProjectProgress;
      
      saveProjectProgress(projectId, remaining);
      
      return {
        ...prev,
        [projectId]: remaining
      };
    });
  }, []);

  // Clear all progress for a project
  const clearProjectProgress = useCallback((projectId: string) => {
    setAllProgress(prev => {
      const { [projectId]: _, ...remaining } = prev;
      localStorage.removeItem(`taskProgress_${projectId}`);
      return remaining;
    });
  }, []);

  return {
    getTaskProgress,
    setTaskProgress,
    getProjectCompletion,
    clearTaskProgress,
    clearProjectProgress
  };
}