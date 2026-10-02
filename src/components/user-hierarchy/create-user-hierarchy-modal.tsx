'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/interfaces/user.interface';
import { Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { Loading } from '../loading';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { createUserHierarchyAction } from '@/actions/user-hierarchy/create-user-hierarchy.action';
import { UserHierarchyDto } from '@/types/dto/user-hierarchy-dto';
import { isApiErrorResponse } from '@/utils/is-api-error-response.util';
import { getUserRoleText } from '@/utils/users/get-user-role-text.util';

// Schema for creating user hierarchy relationship
const CreateUserHierarchySchema = z.object({
  managerId: z.string().min(1, { message: 'Selecione um gerente' }),
  subordinateId: z.string().min(1, { message: 'Selecione um subordinado' }),
}).refine((data) => data.managerId !== data.subordinateId, {
  message: 'O gerente e subordinado devem ser pessoas diferentes',
  path: ['subordinateId'],
});

interface CreateUserHierarchyModalProps {
  open: boolean;
  onClose: () => void;
  usersData: User[];
  companyId: number;
  onSuccess?: () => void;
}

export function CreateUserHierarchyModal({
  open,
  onClose,
  usersData,
  companyId,
  onSuccess
}: CreateUserHierarchyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [managerId, setManagerId] = useState<string>('');
  const [subordinateId, setSubordinateId] = useState<string>('');
  const [managerError, setManagerError] = useState<string | null>(null);
  const [subordinateError, setSubordinateError] = useState<string | null>(null);

  const onSubmit = async () => {
    setManagerError(null);
    setSubordinateError(null);

    const validationResult = CreateUserHierarchySchema.safeParse({ managerId, subordinateId });

    if (!validationResult.success) {
      validationResult.error.errors.forEach(err => {
        if (err.path[0] === 'managerId') {
          setManagerError(err.message);
        } else if (err.path[0] === 'subordinateId') {
          setSubordinateError(err.message);
        }
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const actionDto: UserHierarchyDto = {
        companyId: Number(companyId),
        managerId: Number(managerId),
        subordinateId: Number(subordinateId),
      };

      const response = await createUserHierarchyAction(actionDto);

      if (isApiErrorResponse(response)) {
        throw new Error(response.message);
      }

      toast({
        title: 'Sucesso',
        status: 'success',
      });

      setManagerId('');
      setSubordinateId('');
      onClose();
      onSuccess?.();
    } catch {
      toast({
        title: 'Erro',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setManagerId('');
      setSubordinateId('');
      setManagerError(null);
      setSubordinateError(null);
      onClose();
    }
  };

  const selectedManagerId = managerId;
  const selectedSubordinateId = subordinateId;

  const availableSubordinates = usersData.filter(user =>
    user.id.toString() !== selectedManagerId
  );

  const availableManagers = usersData.filter(user =>
    user.id.toString() !== selectedSubordinateId
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Criar Relacionamento Hierárquico
          </DialogTitle>
          <DialogDescription>
            Defina um relacionamento de hierarquia entre dois usuários existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="managerId" className="text-base font-medium">Gerente/Supervisor</label>
              <Select onValueChange={setManagerId} value={managerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gerente" />
                </SelectTrigger>
                <SelectContent>
                  {availableManagers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-gray-500">{getUserRoleText(user.role)}
                        {user.position && (<span> - {user.position}</span>)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {managerError && <p className="text-sm font-medium text-destructive mt-2">{managerError}</p>}
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="h-px bg-gray-300 w-8"></div>
                <span className="text-sm">reporta para</span>
                <div className="h-px bg-gray-300 w-8"></div>
              </div>
            </div>

            <div>
              <label htmlFor="subordinateId" className="text-base font-medium">Subordinado</label>
              <Select onValueChange={setSubordinateId} value={subordinateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o subordinado" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubordinates.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-gray-500">{getUserRoleText(user.role)}
                        {user.position && (<span> - {user.position}</span>)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subordinateError && <p className="text-sm font-medium text-destructive mt-2">{subordinateError}</p>}
            </div>
          </div>

          {selectedManagerId && selectedSubordinateId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="h-4 w-4" />
                <span className="font-medium">Relacionamento a ser criado:</span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                <span className="font-medium">
                  {usersData.find(u => u.id.toString() === selectedSubordinateId)?.name}
                </span>
                {' '}reportará para{' '}
                <span className="font-medium">
                  {usersData.find(u => u.id.toString() === selectedManagerId)?.name}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loading />
                  <span>Criando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Criar Relacionamento</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
