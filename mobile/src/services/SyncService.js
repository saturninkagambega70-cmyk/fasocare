import { initDatabase, getPendingActions, deletePendingAction } from '../database/db';
import NetInfo from '@react-native-community/netinfo';
import { medicalService, vaccinationService, appointmentService } from './api';

let isSyncing = false;

export const syncOfflineData = async () => {
  if (isSyncing) return;
  
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  isSyncing = true;
  const db = await initDatabase();
  const pendingActions = await getPendingActions(db);

  for (const action of pendingActions) {
    try {
      const payload = JSON.parse(action.payload);
      
      switch (action.action_type) {
        case 'CREATE_CONSULTATION':
          const consultation = await medicalService.createConsultation(
            payload.patientId, 
            payload.diagnosis, 
            payload.treatmentPlan, 
            payload.vitals
          );
          if (consultation?.id && payload.medicines?.length) {
            await medicalService.addPrescriptionItems(
              consultation.id,
              payload.medicines.map(m => ({
                medicineName: m.medicineName,
                dosage: m.dosage,
                quantity: m.quantity,
                timeOfDay: m.timeOfDay || 'Matin',
              }))
            );
          }
          break;
        case 'REPORT_EPIDEMIC':
          await medicalService.reportEpidemic(payload);
          break;
        case 'SEND_MESSAGE':
          await medicalService.sendMessage(payload.receiverId, payload.content);
          break;
        case 'SEND_SOS':
          await medicalService.sendSOS(payload);
          break;
        case 'ADD_VACCINATION_RECORD':
          await vaccinationService.addRecord(payload);
          break;
        case 'CREATE_APPOINTMENT':
          await appointmentService.create(payload);
          break;
        case 'UPDATE_APPOINTMENT':
          await appointmentService.confirm(payload.id);
          break;
        default:
          break;
      }

      await deletePendingAction(db, action.id);
    } catch (error) {
      if (__DEV__) console.error(`Sync failed for action ${action.id}:`, error.message);
    }
  }

  isSyncing = false;
};

export const startNetworkMonitoring = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncOfflineData();
    }
  });
};
