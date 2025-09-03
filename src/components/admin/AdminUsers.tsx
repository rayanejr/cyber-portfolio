import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lock } from "lucide-react";

interface AdminUsersProps {
  currentUser: {
    id: string;
    full_name: string;
  } | null;
}

const AdminUsers = ({ currentUser }: AdminUsersProps) => {
  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette section.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Gestion des Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Section Simplifiée</h3>
          <p className="text-muted-foreground mb-4">
            La gestion des utilisateurs a été simplifiée pour cette interface.
            Seul l'administrateur principal peut accéder au système.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Sécurité ANSSI :</strong><br />
              • Mots de passe forts obligatoires (12+ caractères)<br />
              • Rate limiting (5 tentatives max)<br />
              • Sessions sécurisées (8h max)<br />
              • Hashage bcrypt des mots de passe<br />
              • Verrouillage automatique des comptes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;