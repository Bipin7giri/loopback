enum User {
  ViewOwnUser = 'ViewOwnUser',
  ViewAnyUser = 'ViewAnyUser',
  CreateAnyUser = 'CreateAnyUser',
  UpdateOwnUser = 'UpdateOwnUser',
  UpdateAnyUser = 'UpdateAnyUser',
  DeleteAnyUser = 'DeleteAnyUser',
  ViewUser = 'ViewUser',
  DeleteOwnUser = "DeleteOwnUser",

  ViewRole = 'ViewRole',
  CreateRole = 'CreateRole',
  UpdateRole = 'UpdateRole',
  DeleteRole = 'DeleteRole',

  ViewAudit = 'ViewAudit',
  CreateAudit = 'CreateAudit',
  UpdateAudit = 'UpdateAudit',
  DeleteAudit = 'DeleteAudit',
}

enum Address {
  ViewAddress = 'ViewAddress',
  CreateAddress = 'CreateAddress',
  UpdateAddress = 'UpdateAddress',
  DeleteAddress = 'DeleteAddress',
}

enum Company {
  ViewCompany = 'ViewCompany',
  CreateCompany = 'CreateCompany',
  UpdateCompany = 'UpdateCompany',
  DeleteCompany = 'DeleteCompany',
}

enum Project {
  ViewProject = 'ViewProject',
  CreateProject = 'CreateProject',
  UpdateProject = 'UpdateProject',
  DeleteProject = 'DeleteProject',
}

enum Transaction {
  ViewTransaction = 'ViewTransaction',
  CreateTransaction = 'CreateTransaction',
}

enum Order {
  ViewOrder = 'ViewOrder',
  CreateOrder = 'CreateOrder',
  UpdateOrder = 'UpdateOrder',
  DeleteOrder = 'DeleteOrder',
  ViewOwnOrder = 'ViewOwnOrder',
}

enum UserFirebase {
  CreateUserFirebase = 'CreateUserFirebase',
  UpdateUserFirebase = 'UpdateUserFirebase',
  ViewUserFirebase = 'ViewUserFirebase',
  DeleteUserFirebase = 'DeleteUserFirebase',
}

enum Config {
  ViewConfig = 'ViewConfig',
  CreateConfig = 'CreateConfig',
  UpdateConfig = 'UpdateConfig',
  DeleteConfig = 'DeleteConfig',
}

enum Template {
  ViewTemplate = 'ViewTemplate',
  CreateTemplate = 'CreateTemplate',
  UpdateTemplate = 'UpdateTemplate',
  DeleteTemplate = 'DeleteTemplate',
}

enum Notification {
  ViewNotification = 'ViewNotification',
  CreateNotification = 'CreateNotification',
  UpdateNotification = 'UpdateNotification',
  DeleteNotification = 'DeleteNotification',
}

enum Wishlist {
  ViewWishlist = 'ViewWishlist',
  CreateWishlist = 'CreateWishlist',
  DeleteWishlist = 'DeleteWishlist',
}

enum Media {
  ViewMedia = 'ViewMedia',
  CreateMedia = 'CreateMedia',
  DeleteMedia = 'DeleteMedia',
}

enum Slider {
  ViewSlider = 'ViewSlider',
  CreateSlider = 'CreateSlider',
  UpdateSlider = 'UpdateSlider',
  DeleteSlider = 'DeleteSlider',
}

enum Category {
  ViewCategory = 'ViewCategory',
  CreateCategory = 'CreateCategory',
  UpdateCategory = 'UpdateCategory',
  DeleteCategory = 'DeleteCategory',
}

enum Article {
  ViewArticle = 'ViewArticle',
  CreateArticle = 'CreateArticle',
  UpdateArticle = 'UpdateArticle',
  DeleteArticle = 'DeleteArticle',
}

enum ProjectImage {
  ViewProjectImage = 'ViewProjectImage',
  CreateProjectImage = 'CreateProjectImage',
  UpdateProjectImage = 'UpdateProjectImage',
  DeleteProjectImage = 'DeleteProjectImage',
}

enum ProjectDetails {
  ViewProjectDetails = 'ViewProjectDetails',
  CreateProjectDetails = 'CreateProjectDetails',
  UpdateProjectDetails = 'UpdateProjectDetails',
  DeleteProjectDetails = 'DeleteProjectDetails',
}

enum ProjectNews {
  ViewProjectNews = 'ViewProjectNews',
  CreateProjectNews = 'CreateProjectNews',
  UpdateProjectNews = 'UpdateProjectNews',
  DeleteProjectNews = 'DeleteProjectNews',
}
enum Settings {
  ViewSettings = 'ViewSetting',
  CreateSettings = 'CreateSettings',
  UpdateSettings = 'UpdateSettings',
  DeleteSettings = 'DeleteSettings'
}

enum Enquiries {
  ViewEnquiries = 'ViewEnquiries',
  CreateEnquiries = 'CreateEnquiries',
  UpdateEnquiries = 'UpdateEnquiries',
  DeleteEnquiries = 'DeleteEnquiries'
}
enum Parnters {
  CreatePartners = 'CreatePartners',
  UpdatePartners = 'UpdatePartners',
  DeletePartners = 'DeleteParnters',
}

enum UserInvestments {
  ViewUserInvestments = 'ViewUserInvestments',
  CreateUserInvestments = 'CreateUserInvestments',
  UpdateUserInvestments = 'UpdateUserInvestments',
  DeleteUserInvestments = 'DeleteUserInvestments'
}


export const PermissionKeyResource = {
  User,
  Address,
  Company,
  Transaction,
  Order,
  UserFirebase,
  Config,
  Template,
  Notification,
  Wishlist,
  Media,
  Slider,
  Category,
  Article,
  Project,
  ProjectImage,
  ProjectDetails,
  ProjectNews,
  Settings,
  Enquiries,
  Parnters,
  UserInvestments
};
