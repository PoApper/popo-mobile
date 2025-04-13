import React, { useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";

const buildings = ["학생회관", "지곡회관", "커뮤니티센터", "RC", "기타"];

type Location = {
    id: string;
    name: string;
    description: string;
    image: any;
  };

const locationsData: { [key: string]: Location[] } = {
  학생회관: [
    { id: "1", name: "1층 홀", description: "학생회관 1층", image: require("../../assets/hall1.png") },
    { id: "2", name: "2층 홀", description: "학생회관 2층", image: require("../../assets/hall1.png") },
    { id: "3", name: "3층 홀", description: "학생회관 3층", image: require("../../assets/hall1.png") },
    { id: "4", name: "4층 홀", description: "학생회관 4층", image: require("../../assets/hall1.png") },
    { id: "5", name: "노래방", description: "학생회관 410호", image: require("../../assets/hall1.png") },
    { id: "6", name: "대회의실", description: "학생회관 3층", image: require("../../assets/hall1.png") },
    { id: "7", name: "아틀라스홀", description: "학생회관 1층, 계단 아래", image: require("../../assets/hall1.png") },
    { id: "8", name: "오아시스 회의실1", description: "학생회관 오아시스", image: require("../../assets/hall1.png") },
    { id: "9", name: "오아시스 회의실2", description: "학생회관 오아시스", image: require("../../assets/hall1.png") },
    { id: "10", name: "음악감상실", description: "학생회관 302호", image: require("../../assets/hall1.png") },
    { id: "11", name: "커리어라운지 상담실 A", description: "학생회관 102호", image: require("../../assets/hall1.png") },
    { id: "12", name: "커리어라운지 상담실 B", description: "학생회관 102호", image: require("../../assets/hall1.png") },
    { id: "13", name: "커리어라운지 세미나실", description: "학생회관 102호", image: require("../../assets/hall1.png") },
  ],
  지곡회관: [
    { id: "1", name: "버거킹 소무대", description: "지곡회관, 버거킹", image: require("../../assets/hall1.png") },
    { id: "2", name: "지곡회관 회의실3", description: "지곡회관", image: require("../../assets/hall1.png") },
  ],
  커뮤니티센터: [
    { id: "1", name: "그룹스터디룸A", description: "커뮤니티센터 203호", image: require("../../assets/hall1.png") },
    { id: "2", name: "그룹스터디룸B", description: "커뮤니티센터 205호", image: require("../../assets/hall1.png") },
    { id: "3", name: "그룹스터디룸C", description: "커뮤니티센터 207호", image: require("../../assets/hall1.png") },
    { id: "4", name: "그룹스터디룸D", description: "커뮤니티센터 209호", image: require("../../assets/hall1.png") },
    { id: "3", name: "시네마실A", description: "커뮤니티센터 103호", image: require("../../assets/hall1.png") },
    { id: "4", name: "시네마실B", description: "커뮤니티센터 105호", image: require("../../assets/hall1.png") },
  ],
  RC: [
    { id: "1", name: "RA 라운지 룸", description: "RC 1층 공용공간", image: require("../../assets/hall1.png") },
    { id: "2", name: "소셜 키친 룸", description: "RC 1층 공용공간", image: require("../../assets/hall1.png") },
    { id: "3", name: "시네마 룸", description: "RC 1층 공용공간", image: require("../../assets/hall1.png") },
    { id: "4", name: "커뮤니티 룸 1", description: "RC 1층 공용공간", image: require("../../assets/hall1.png") },
    { id: "5", name: "커뮤니티 룸 2", description: "RC 1층 공용공간", image: require("../../assets/hall1.png") },
  ],
  기타: [
    { id: "1", name: "78 계단", description: "78 계단", image: require("../../assets/hall1.png") },
  ],
};

const backIcon = require("../../assets/backward.png");

const PlaceReservationScreen = () => {
  const [selectedBuilding, setSelectedBuilding] = useState("학생회관");
  const [textWidths, setTextWidths] = useState<{ [key: string]: number }>({});
  const [sortType, setSortType] = useState("가나다순");

  const locations = [...(locationsData[selectedBuilding] || [])];

  if (sortType === "가나다순") {
    locations.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity>
            <Image source={backIcon} style={styles.backIcon} />
          </TouchableOpacity>

        <Text style={styles.title}>장소 예약</Text>
      </View>

      {/* 건물 선택 네비게이션 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buildingNav}>
        {buildings.map((building) => (
          <TouchableOpacity
            key={building}
            onPress={() => setSelectedBuilding(building)}
            style={styles.buildingTabWrapper}
          >
            <View style={styles.buildingTabInner}>
              <View style={styles.textWithUnderline}>
              <Text
                style={[
                  styles.buildingTab,
                  selectedBuilding === building && styles.selectedBuildingText,
                ]}
                onLayout={(e) => {
                  const width = e.nativeEvent.layout.width;
                  setTextWidths((prev) => ({ ...prev, [building]: width }));
                }}
              >
                {building}
              </Text>

                {selectedBuilding === building && <View style={[
                  styles.underline,
                  { width: (textWidths[building] || 0) + 8 },
                ]} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 정렬 버튼 */}
      <View style={styles.sortButtons}>
        {["가나다순", "예약 많은 순"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.sortButton, sortType === type && styles.activeSort]}
            onPress={() => setSortType(type)}
          >
            <Text style={[styles.sortButtonText, sortType === type && styles.activeSortText]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 장소 리스트 */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 0, justifyContent: 'flex-start' }}
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.locationItem}>
            <Image source={item.image} style={styles.locationImage} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{item.name}</Text>
              <Text style={styles.locationDescription}>{item.description}</Text>
            </View>
            <TouchableOpacity style={styles.reserveButton}>
              <Text style={styles.reserveButtonText}>예약</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 15 },
  backButton: { fontSize: 24, fontWeight: "bold", color: "#000", marginRight: 10 },
  backIcon: { width: 24, height: 24, resizeMode: "contain", marginRight: 10  },
  title: { fontSize: 20, fontWeight: "bold" },

  buildingNav: { flexDirection: "row", paddingHorizontal: 15, marginTop: 20},
  selectedBuilding: { color: "#000", fontWeight: "bold", borderBottomWidth: 2, borderBottomColor: "#000" },

  buildingTabWrapper: {
    alignItems: "center",
    margin: 2
  },

  buildingTabInner: {
    alignItems: "center",
    paddingHorizontal: 2,
  },

  textWithUnderline: {
    paddingHorizontal: 6,
    alignItems: "center",
  },

  buildingTab: {
    fontSize: 16,
    color: "#999",
    lineHeight: 20,
  },

  selectedBuildingText: {
    color: "#000",
    fontWeight: "bold",
    lineHeight: 20,
  },

  underline: {
    marginTop: 4,
    height: 2,
    backgroundColor: "#000",
    borderRadius: 1,
    alignSelf: "center",
  },

  /* 정렬 버튼 */
  sortButtons: { flexDirection: "row", paddingHorizontal: 15, marginTop: -580, marginBottom: 10 },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
  },
  activeSort: { backgroundColor: "#000", borderColor: "#000" },
  sortButtonText: { fontSize: 14, color: "#000" },
  activeSortText: { color: "#fff" },

  /* 장소 리스트 */
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  locationImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },

  locationInfo: {
    flex: 1,
  },
  locationName: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  locationDescription: { fontSize: 14, color: "#777" },
  reserveButton: {
    backgroundColor: "#F3F3F3",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginLeft: 10,
  },
  reserveButtonText: { fontSize: 14, fontWeight: "600", color: "#000" },
});

export default PlaceReservationScreen;