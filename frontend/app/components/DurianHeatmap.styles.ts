import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  mapControls: {
    marginBottom: 16,
  },
  mapTitleSection: {
    marginBottom: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d7a3e',
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  controlButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  controlButtonActive: {
    backgroundColor: '#27AE60',
  },
  controlButtonText: {
    color: '#222',
    fontWeight: '600',
  },
  mapViewport: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#e0f2f1',
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    marginTop: 12,
    color: '#15803d',
    fontSize: 15,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mapPlaceholderText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  mapLegend: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendColor: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
  },
});

export default styles;
