import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";
import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function profile() {
  const auth = useContext(AuthContext);
  const tab = useContext(TabContext);

  useEffect(() => {
    tab?.setActive("Profile");
  }, []);
  return (
    <View className="flex-1">
      <Text>profile</Text>
      <TouchableOpacity onPress={() => auth?.logoutUser()}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({});
