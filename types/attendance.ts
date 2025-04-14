export type MemberCategory = 'OM' | 'FT' | 'RN' | 'XT' | 'V';

export type MemberSubCategories = {
  gender: 'male' | 'female';
  isBeliever: boolean;
  isDisciple: boolean;
  inMinistryHouse: boolean;
  isPrimaryLeader: boolean;
  isSecondaryLeader: boolean;
  isMarried: boolean;
};

export type Member = {
  id: string;
  name: string;
  category: MemberCategory;
  subCategories: MemberSubCategories;
  createdAt: string;
  updatedAt: string;
};

export type Meeting = {
  id: string;
  name: string;
  description: string;
  date: string;
  type: 'homechurch' | 'central_teaching' | 'prayer_group' | 'mens_cell' | 'womens_cell' | 'special';
  specialNote?: string;
};

export type Attendance = {
  id: string;
  meetingId: string;
  memberId: string;
  isPresent: boolean;
  date: string;
};

export type AttendanceStats = {
  total: number;
  byCategory: Record<MemberCategory, number>;
  bySubCategory: {
    gender: Record<'male' | 'female', number>;
    believers: number;
    disciples: number;
    ministryHouse: number;
    primaryLeaders: number;
    secondaryLeaders: number;
    married: number;
  };
};