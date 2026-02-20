import React, { useRef, useState } from 'react';
import { Modal, View, Text, Image, FlatList, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useNavigationHistory } from '../navigation/NavigationHistoryContext';

interface HeaderProps {
  /** If provided, header renders as "title-only" mode (no profile, no bell). */
  title?: string;
  /** Show back button instead of hamburger menu */
  showBack?: boolean;
  /** Custom right button component */
  rightButton?: React.ReactNode;
  attendance?: '' | 'present' | 'absent';
  customBackAction?: () => void;
  notifications?: any;
  setNotifications?: any;
  userName?: any;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  rightButton,
  attendance,
  customBackAction,
  setNotifications,
  notifications,
  userName
}) => {
  const navigation = useNavigation<any>();
  const { getPreviousScreen } = useNavigationHistory();

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const bellRef = useRef<any>(null);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    right: 0,
    arrowLeft: 0,
  });

  // const [notifications, setNotifications] = useState([
  //   { id: '1', title: 'Attendance submitted successfully' },
  //   { id: '2', title: 'New Collection added' },
  //   { id: '3', title: 'Target completed successfully!!' },
  // ]);

  const removeNotification = (id: string) => {
    setNotifications((prev: any) => prev.filter((item: any) => item.id !== id));
  };

  const isDashboard = !title;

  const handleLeftPress = () => {
    if (showBack) {
      if (customBackAction) {
        customBackAction(); // Use custom action if provided
        return;
      }

      // First try to go back in the current stack
      if (navigation.canGoBack()) {
        const state = navigation.getState();
        const currentRoute = state?.routes[state?.index || 0];

        // Check if we're at the root of the current stack (index 0)
        if (currentRoute && state?.index === 0) {
          // At root of stack, check history for previous tab
          const previous = getPreviousScreen();
          if (previous) {
            // Navigate to the previous screen in history
            try {
              navigation.navigate(
                'MainTabs' as never,
                {
                  screen: previous.stack as never,
                  params: { screen: previous.screen as never },
                } as never,
              );
              return;
            } catch (e) {
              // Fallback to normal goBack if navigation fails
              navigation.goBack();
              console.log(e);
            }
          }
        }

        // Not at root or no history, use normal goBack
        navigation.goBack();
      } else {
        // Can't go back in current stack, use history to navigate to previous tab
        const previous = getPreviousScreen();
        if (previous) {
          try {
            navigation.navigate(
              'MainTabs' as never,
              {
                screen: previous.stack as never,
                params: { screen: previous.screen as never },
              } as never,
            );
          } catch (e) {
            console.log(e);
          }
        }
      }
    } else {
      navigation.openDrawer?.();
    }
  };

  const handleDone = () => {
    setShowNotifications(false)
  }
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <Pressable onPress={handleLeftPress}>
          <Feather
            name={showBack ? 'arrow-left' : 'menu'}
            size={28}
            color="#fff"
          />
        </Pressable>

        {isDashboard ? (
          <View style={styles.profileRow}>
            <Image
              source={{ uri: `https://placehold.co/50x50.png?text=${userName?.slice(0, 1).toUpperCase()}` }}
              style={styles.profileImage}
            />

            <View>
              <Text style={styles.welcomeText}>Welcome ,</Text>
              <View style={[styles.attendanceBadge]}>
                <Text style={styles.companyText}>{userName || ''}</Text>

                <View
                  style={[

                    attendance == ''
                      ? ''
                      : attendance == 'present'
                        ? styles.presentBadge
                        : styles.absentBadge,
                  ]}
                >
                  {attendance !== '' && (
                    <Ionicons
                      name={
                        attendance === 'present'
                          ? 'checkmark-circle'
                          : 'close-circle'
                      }
                      size={14}
                      color="#fff"
                      style={{ marginRight: 4 }}
                    />
                  )}

                  <Text style={styles.badgeText}>
                    {attendance == ''
                      ? ''
                      : attendance == 'present'
                        ? 'Present'
                        : 'Absent'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.screenTitle}>{title}</Text>
        )}
      </View>

      {isDashboard && !rightButton && (
        <TouchableOpacity
          ref={bellRef}
          onPress={() => {
            bellRef.current?.measureInWindow(
              (x: number, y: number, width: number, height: number) => {
                setPopupPosition({
                  top: y + height + 10,
                  right: 16,
                  arrowLeft: x + width / 2 - 6, // for arrow
                });
                setShowNotifications(true);
              }
            );
          }}
          style={styles.bellWrapper}
        >
          <Feather name="bell" size={24} color="#fff" />

          {notifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notifications.length > 9 ? '9+' : notifications.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}



      <Modal visible={showNotifications} transparent animationType="fade">
        <Pressable style={styles.overlay}>

          {/* Arrow */}
          <View
            style={[
              styles.arrow,
              {
                top: popupPosition.top - 10,
                left: popupPosition.arrowLeft + 2,
              },
            ]}
          />

          {/* Popup */}
          <View
            style={[
              styles.popup,
              {
                position: 'absolute',
                top: popupPosition.top,
                right: popupPosition.right,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.title}>Notifications</Text>

              {notifications?.length > 0 && (

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setNotifications([])}
                >
                  <Text style={styles.doneText}><Feather name="trash-2" color="#ED1A3B" size={20} /></Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={notifications}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No notifications</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationText}>{item.title}</Text>
                  <TouchableOpacity onPress={() => removeNotification(item.id)}>
                    <Feather name="x" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>



      {rightButton && rightButton}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  leftSection: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 999,
  },

  welcomeText: {
    color: '#fff',
    fontSize: 13,
  },

  companyText: {
    color: '#E9E648',
    fontSize: 16,
    fontWeight: '700',
    paddingRight: 5,
  },

  screenTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },

  presentBadge: {
    flexDirection: 'row',
    padding: 2,
    paddingHorizontal: 4,
    borderRadius: 15,
    backgroundColor: '#22C55E', // green
  },

  absentBadge: {
    flexDirection: 'row',
    padding: 2,
    paddingHorizontal: 4,
    borderRadius: 15,
    backgroundColor: '#EF4444', // red
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Notification Popup 

  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 4,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },

  bellWrapper: {
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popup: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderTopRightRadius: 5,
    padding: 16,
    maxHeight: '70%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  notificationText: {
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButton: {
    // backgroundColor: '#ED1A3B',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Header;