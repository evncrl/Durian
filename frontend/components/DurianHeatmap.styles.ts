import { StyleSheet } from 'react-native';
import { Fonts, Palette } from '@/constants/theme';

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: 'rgba(12, 26, 16, 0.7)', // Translucent obsidian
    borderRadius: 24,
    padding: 24,
    margin: 16,
    // Removed border for clean look
    elevation: 5,
  },
  mapControls: {
    marginBottom: 16,
  },
  mapTitleSection: {
    marginBottom: 8,
  },
  mapTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Palette.warmCopper,
  },
  mapSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Palette.linenWhite,
    opacity: 0.7,
  },
  controlButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  controlButtonActive: {
    backgroundColor: Palette.warmCopper,
  },
  controlButtonText: {
    color: Palette.linenWhite,
    fontFamily: Fonts.semiBold,
  },
  mapViewport: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Palette.linenWhite,
    marginBottom: 10,
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
    color: Palette.linenWhite,
    opacity: 0.8,
  },
});

export default styles;

