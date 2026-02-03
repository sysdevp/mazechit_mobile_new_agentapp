import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  items: DropdownItem[];
  placeholder: string;
  error?: string;
  value1?: string;
  onChangeValue: (value: string | null) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  items,
  placeholder,
  error,
  value1,
  onChangeValue,
}) => {
  const [value, setValue] = useState<string | null>(value1 || null);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={{ marginBottom: 18}}>
      <Text style={styles.label}>{label}</Text>

      <Dropdown
        style={[
          styles.dropdown,
          error && { borderColor: 'red', borderWidth: 1 },
          isFocus && { borderColor: '#E6F2F5' },
        ]}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.dropdownText}
        itemTextStyle={styles.dropdownText}
        containerStyle={styles.listContainer}
        itemContainerStyle={styles.itemContainer}
        activeColor="rgba(255,255,255,0.33)"
        data={items}
        maxHeight={220}
        dropdownPosition="top" 
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          onChangeValue(item.value);
          setIsFocus(false);
        }}
        renderRightIcon={() => (
          <Icon
            name={isFocus ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#E6F2F5"
          />
        )}
      />
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  label: {
    color: '#E6F2F5',
    fontSize: 14,
    marginBottom: 6,
  },
  dropdown: {
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
  },
  listContainer: {
    backgroundColor: '#0b7383',
    borderRadius: 15,
    borderWidth: 0,
  },

  itemContainer: {
    backgroundColor: '#0b7383',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    marginBottom: 0

  },
  dropdownText: {
    color: '#fff',
    fontSize: 15,
  },
  placeholder: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
});
