import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { apiService } from './api';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface LocationTaskData {
  agentId: number;
}

// Définir la tâche de localisation en arrière-plan
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      try {
        // Récupérer l'ID de l'agent stocké
        const taskData = await TaskManager.getTaskOptionsAsync(LOCATION_TASK_NAME);
        const agentId = (taskData as any)?.agentId;
        
        if (agentId) {
          await apiService.updateLocation(
            agentId,
            location.coords.latitude,
            location.coords.longitude
          );
          console.log('Location sent successfully');
        }
      } catch (error) {
        console.error('Failed to send location:', error);
      }
    }
  }
});

class LocationService {
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    return backgroundStatus === 'granted';
  }

  async startLocationTracking(agentId: number): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      return false;
    }

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: 100, // Mètres
        foregroundService: {
          notificationTitle: 'ENEO Agent',
          notificationBody: 'Suivi de localisation actif',
        },
      });

      // Stocker l'ID de l'agent dans les options de la tâche
      await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
      TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
        if (error) {
          console.error('Location task error:', error);
          return;
        }

        if (data?.locations) {
          const location = data.locations[0];
          if (location) {
            try {
              await apiService.updateLocation(
                agentId,
                location.coords.latitude,
                location.coords.longitude
              );
            } catch (error) {
              console.error('Failed to send location:', error);
            }
          }
        }
      });

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: 100,
        foregroundService: {
          notificationTitle: 'ENEO Agent',
          notificationBody: 'Suivi de localisation actif',
        },
      });

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      this.isTracking = false;
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    }
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = new LocationService();