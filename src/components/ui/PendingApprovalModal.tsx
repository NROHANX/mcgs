import React from 'react';
import { Clock, Mail, Phone, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'customer' | 'provider';
  email: string;
}

const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({ 
  isOpen, 
  onClose, 
  userType, 
  email 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 text-center">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Registration Submitted
          </h2>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-medium text-orange-800">Pending Admin Approval</span>
            </div>
            <p className="text-orange-700 text-sm">
              Your {userType} registration request has been submitted and is awaiting approval from our administrators.
            </p>
          </div>
          
          <div className="text-left space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                  Our admin team will review your registration request
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                  You'll receive an email notification once approved
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                  {userType === 'provider' 
                    ? 'Complete your provider profile and start receiving bookings'
                    : 'Start booking services from verified providers'
                  }
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Registration Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Email:</span> {email}</p>
                <p><span className="font-medium">Account Type:</span> {userType}</p>
                <p><span className="font-medium">Status:</span> Pending Approval</p>
                <p><span className="font-medium">Submitted:</span> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Need help or have questions?</p>
              <div className="flex items-center justify-center space-x-4">
                <a 
                  href="mailto:mcgs.ngpmsi@gmail.com" 
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email Support
                </a>
                <a 
                  href="tel:+919881670078" 
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call Support
                </a>
              </div>
            </div>
            
            <Button onClick={onClose} fullWidth>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalModal;