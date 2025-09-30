export type Member = {
  id: string;
  avatar: string;
  name: string;
  birthday: string;
  email: string;
  hobbies: string;
  socials: string[];
  startDate: string;
  type: string;
  jobType: string[];
  team: string;
  teamId: string;
};

export type NewMember = Omit<Member, "id">;

export type Social = {
  platform: string;
  url: string;
};