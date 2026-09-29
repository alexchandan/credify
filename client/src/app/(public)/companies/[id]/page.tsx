import { PublicCompanyProfile } from "@/components/company/PublicCompanyProfile";

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  return <PublicCompanyProfile companyId={id} />;
}
