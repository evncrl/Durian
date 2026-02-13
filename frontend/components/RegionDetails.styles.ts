import { StyleSheet } from 'react-native';
import { Fonts } from '@/constants/theme';

const styles = StyleSheet.create({
  regionDetailContainer: {
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
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  regionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#2d7a3e',
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#888',
  },
  regionContent: {
    marginTop: 8,
  },
  regionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#222',
  },
  producersContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  producerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  producerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  producerRankText: {
    fontFamily: Fonts.bold,
    color: '#2d7a3e',
  },
  producerInfo: {
    flex: 1,
  },
  producerName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#222',
  },
  producerValue: {
    fontSize: 14,
    color: '#888',
  },
  producerChevron: {
    marginLeft: 8,
  },
});

export default styles;

